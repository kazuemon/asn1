import * as v from "valibot";
import { Asn1Data } from "..";
import { TagClass, UniversalClassTag } from "../const";
import {
  BaseSchema,
  OverrideIdentifierConfig,
  IdentifierSettledBaseSchema,
  SchemaMismatchError,
  Identifier,
} from "./base";

type SequenceField<
  Name extends string,
  Schema extends BaseSchema<any, any>,
  IsOptional extends boolean,
> = {
  name: Name;
  schema: Schema;
  optional: IsOptional;
};

export const field = <
  const Name extends string,
  Schema extends BaseSchema<any, any>,
  const IsOptional extends boolean = false,
>({
  name,
  schema,
  optional = false as IsOptional,
}: PartialByKeys<
  SequenceField<Name, Schema, IsOptional>,
  "optional"
>): SequenceField<Name, Schema, IsOptional> => ({ name, schema, optional });

type AnySequenceField = SequenceField<any, any, any>;

type SequenceFieldAry = AnySequenceField[];

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
  fields:
    | UniqueCheckedSequenceFieldAry<T>
    | ((f: typeof field) => UniqueCheckedSequenceFieldAry<T>);
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

type SequenceFieldsObjectType<T extends SequenceFieldAry> = PartialByKeys<
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
  T extends SequenceFieldAry,
  TClass extends TagClass = typeof TagClass.UNIVERSAL,
  TType extends number = typeof UniversalClassTag.SEQUENCE_AND_SEQUENCE_OF,
> extends IdentifierSettledBaseSchema<
  SequenceFieldsObjectType<T>,
  TClass,
  TType,
  true
> {
  private fields;
  protected nativeSchema;

  constructor({
    fields,
    tagClass = TagClass.UNIVERSAL,
    tagType = UniversalClassTag.SEQUENCE_AND_SEQUENCE_OF,
  }: SequenceConfig<T, TClass, TType>) {
    const _fields = typeof fields === "function" ? fields(field) : fields;
    super(
      {
        tagClass: tagClass as TClass,
        tagType: tagType as TType,
        isConstructed: true,
      },
      optionalTuple(_fields),
    );
    this.fields = _fields;
    this.nativeSchema = v.object(
      Object.fromEntries(
        this.fields.map(
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
    return new SequenceSchema({ ...newIdentifier, fields: this.fields });
  }

  decodeValue(data: Asn1Data[]) {
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
  T extends SequenceFieldAry,
  TClass extends TagClass = typeof TagClass.UNIVERSAL,
  TType extends number = typeof UniversalClassTag.SEQUENCE_AND_SEQUENCE_OF,
>(
  config: SequenceConfig<T, TClass, TType>,
) => new SequenceSchema(config);
