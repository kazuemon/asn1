import * as v from "valibot";
import { Asn1Data } from "..";
import { TagClass, UniversalClassTag } from "../const";
import { idSchemaFactory } from "../utils/schema";
import { BaseSchema, CustomConfig, ValibotSchema } from "./base";

type SequenceField<
  TSType,
  Asn1Schema extends v.BaseSchema,
  NativeSchema extends v.BaseSchema,
> = Readonly<{
  name: string;
  schema: BaseSchema<TSType, Asn1Schema, NativeSchema>;
  optional?: boolean;
}>;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type AnySequenceField = SequenceField<any, v.BaseSchema, v.BaseSchema>;

type SequenceFieldAry = Readonly<[AnySequenceField, ...AnySequenceField[]]>;

type SequenceConfig<T extends SequenceFieldAry> = CustomConfig & {
  fields: T;
};

// Thanks https://stackoverflow.com/questions/56988970/tuple-to-object-in-typescript-via-generics
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type TupleToObject<T extends Readonly<[string, any]>> = {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  v.special<[any, ...any[]]>((input) => {
    if (!Array.isArray(input)) return false;
    let curSchemaIndex = 0;
    let curAryIndex = 0;
    while (curAryIndex < input.length && curSchemaIndex < fields.length) {
      const res = v.safeParse(
        fields[curSchemaIndex].schema._valibot.asn1Schema,
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

export const sequence = <const T extends SequenceFieldAry>(
  config: SequenceConfig<T>,
) => {
  const _tagClass = config?.tagClass ?? TagClass.UNIVERSAL;
  const _tagType: number =
    config?.tagType ?? UniversalClassTag.SEQUENCE_AND_SEQUENCE_OF;
  const _asn1Schema = v.object({
    id: idSchemaFactory({
      tagClass: _tagClass,
      isConstructed: true,
      tagType: _tagType,
    }),
    len: v.number([v.minValue(0)]),
    value: optionalTuple(config.fields),
  });
  const _nativeSchema = v.object(
    Object.fromEntries(
      config.fields.map(
        (f) =>
          [
            f.name,
            f.optional
              ? v.optional(f.schema._valibot.nativeSchema)
              : f.schema._valibot.nativeSchema,
          ] as [string, v.BaseSchema],
      ),
    ),
  );
  return new (class SequenceSchema extends BaseSchema<
    SequenceFieldsObjectType<T>,
    typeof _asn1Schema,
    typeof _nativeSchema
  > {
    _valibot: ValibotSchema<typeof _asn1Schema, typeof _nativeSchema> = {
      asn1Schema: _asn1Schema,
      nativeSchema: _nativeSchema,
    };
    tagClass = _tagClass;
    tagType = _tagType;
    fields = config.fields;

    decode(asnData: Asn1Data) {
      const parsedData = v.parse(this._valibot.asn1Schema, asnData);
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const obj: SequenceFieldsObjectType<T> = {} as any;
      for (let i = 0; i < parsedData.value.length; i++) {
        const field = this.fields[i];
        obj[field.name as keyof SequenceFieldsObjectType<T>] =
          field.schema.decode(parsedData.value[i]);
      }
      return obj;
    }

    encode(data: SequenceFieldsObjectType<T>) {
      const parsedData = v.parse(
        this._valibot.nativeSchema,
        data,
      ) as SequenceFieldsObjectType<T>;
      const uint8AryFields: Uint8Array[] = [];
      for (const field of this.fields) {
        if (!(field.name in parsedData)) continue;
        const res = field.schema.encode(
          parsedData[field.name as keyof SequenceFieldsObjectType<T>],
        );
        uint8AryFields.push(res);
      }
      const value = Buffer.concat(uint8AryFields);
      let uint8Ary = Uint8Array.from([
        (this.tagClass << 6) + 32 + this.tagType,
        value.length,
      ]);
      uint8Ary = Buffer.concat([uint8Ary, value]);
      return uint8Ary;
    }
  })();
};
