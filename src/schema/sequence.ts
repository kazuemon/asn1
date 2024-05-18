import * as v from "valibot";
import { TagClass, UniversalClassTag } from "../const";
import type { Asn1Data } from "../types";
import {
  type BaseSchema,
  type Identifier,
  IdentifierSettledBaseSchema,
  type OverrideIdentifierConfig,
  SchemaMismatchError,
} from "./base";

type SequenceField<ToType, FromType> = Readonly<{
  name: string;
  schema: BaseSchema<ToType, FromType>;
  optional?: boolean;
}>;

type AnySequenceField = SequenceField<any, any>;

type SequenceFieldAry = ReadonlyArray<AnySequenceField>;

type OtherSequenceFieldIndexTuple<
  T extends SequenceFieldAry,
  K extends number | `${number}`,
> = Exclude<Extract<keyof T, `${number}`>, `${K}`>;

type UniqueCheckedSequenceFieldAry<T extends SequenceFieldAry> = {
  [K in keyof T]: OtherSequenceFieldIndexTuple<T, K> extends never
    ? T[K]
    : T[K]["name"] extends T[OtherSequenceFieldIndexTuple<T, K>]["name"]
      ? `name '${T[K]["name"]}' must be unique`
      : T[K];
};

type SequenceConfig<
  T extends SequenceFieldAry,
  TClass extends TagClass,
  TType extends number,
> = OverrideIdentifierConfig<TClass, TType> & {
  fields: UniqueCheckedSequenceFieldAry<T>;
};

// Thanks https://stackoverflow.com/questions/56988970/tuple-to-object-in-typescript-via-generics
type TupleToObject<T extends Readonly<[string, any]>> = {
  [K in T[0]]: Extract<T, [K, any]>[1];
};

type SequenceAllFieldsTuple<T extends SequenceFieldAry> = {
  [P in keyof T]: [T[P]["name"], ReturnType<T[P]["schema"]["decode"]>];
};

type SequenceOptionalFieldsNameTuple<T extends SequenceFieldAry> = Extract<
  T[number],
  { optional: true }
>["name"];

type SequenceAllFieldsObjectType<T extends SequenceFieldAry> = TupleToObject<
  SequenceAllFieldsTuple<T>[number]
>;

type PartialByKeys<T, Keys extends keyof T> = Omit<T, Keys> &
  Partial<Pick<T, Keys>>;

export type SequenceFieldsObjectType<T extends SequenceFieldAry> =
  SequenceOptionalFieldsNameTuple<T> extends never
    ? SequenceAllFieldsObjectType<T>
    : PartialByKeys<
        SequenceAllFieldsObjectType<T>,
        SequenceOptionalFieldsNameTuple<T>
      >;

export const optionalTuple = (fields: SequenceFieldAry) =>
  v.special<[any, ...any[]]>((input) => {
    if (!Array.isArray(input)) return false;
    let curSchemaIndex = 0;
    let curAryIndex = 0;
    while (curAryIndex < input.length && curSchemaIndex < fields.length) {
      const res = v.safeParse(
        fields[curSchemaIndex].schema.getAsn1Schema(),
        input[curAryIndex],
      );
      if (res.success) {
        curAryIndex++;
      } else {
        if (!fields[curSchemaIndex].optional) return false;
      }
      curSchemaIndex++;
    }
    // Check if all inputs are validated
    if (input.length !== curAryIndex) return false;
    // Check for non-Optional fields in the rest of the schema
    for (let i = curSchemaIndex; i < fields.length; i++) {
      if (!fields[curSchemaIndex].optional) return false;
    }
    return true;
  });

export class SequenceSchema<
  const T extends SequenceFieldAry,
  TClass extends TagClass = typeof TagClass.UNIVERSAL,
  TType extends number = typeof UniversalClassTag.SEQUENCE_AND_SEQUENCE_OF,
> extends IdentifierSettledBaseSchema<
  SequenceFieldsObjectType<T>,
  TClass,
  TType,
  true
> {
  private fields: T;
  protected nativeSchema;

  constructor({
    fields,
    tagClass = TagClass.UNIVERSAL,
    tagType = UniversalClassTag.SEQUENCE_AND_SEQUENCE_OF,
  }: SequenceConfig<T, TClass, TType>) {
    super(
      {
        tagClass: tagClass as TClass,
        tagType: tagType as TType,
        isConstructed: true,
      },
      optionalTuple(fields),
    );
    this.fields = fields as T;
    this.nativeSchema = v.object(
      Object.fromEntries(
        fields.map(
          (f) =>
            [
              f.name,
              f.optional
                ? v.optional(f.schema.getNativeSchema())
                : f.schema.getNativeSchema(),
            ] as [string, v.BaseSchema],
        ),
      ),
    );
  }

  getFields() {
    return this.fields;
  }

  changeIdentifier<
    NewTClass extends TagClass = TClass,
    NewTType extends number = TType,
  >(
    newIdentifier: Partial<
      Identifier<TagClass | NewTClass, number | NewTType, true>
    > = this.getIdentifier(),
  ) {
    return new SequenceSchema({
      ...newIdentifier,
      fields: this.fields,
    }) as SequenceSchema<T, NewTClass, NewTType>;
  }

  decodeValue(data: Asn1Data[]): SequenceFieldsObjectType<T> {
    const obj: SequenceFieldsObjectType<T> = {} as any;
    let curAryIndex = 0;
    let curSchemaIndex = 0;
    const dataLength = data.length;
    while (curAryIndex < dataLength) {
      const field = this.fields[curSchemaIndex];
      try {
        obj[field.name as keyof SequenceFieldsObjectType<T>] =
          field.schema.decode(data[curAryIndex]);
        curAryIndex++;
        curSchemaIndex++;
      } catch (err) {
        if (err instanceof SchemaMismatchError && field.optional) {
          curSchemaIndex++;
          continue;
        }
        throw err;
      }
    }
    return obj;
  }

  encodeValue(data: SequenceFieldsObjectType<T>) {
    const uint8AryFields: Uint8Array[] = [];
    for (const field of this.fields) {
      if (!(field.name in data)) continue;
      const res = field.schema.encode(
        data[field.name as keyof SequenceFieldsObjectType<T>],
      );
      uint8AryFields.push(res);
    }
    return Buffer.concat(uint8AryFields);
  }
}

export const sequence = <
  const T extends SequenceFieldAry,
  TClass extends TagClass = typeof TagClass.UNIVERSAL,
  TType extends number = typeof UniversalClassTag.SEQUENCE_AND_SEQUENCE_OF,
>(
  config: SequenceConfig<T, TClass, TType>,
) => new SequenceSchema(config);
