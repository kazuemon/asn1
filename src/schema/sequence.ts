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
}>;

type SequenceFieldAry = Readonly<
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  [SequenceField<any, any, any>, ...SequenceField<any, any, any>[]]
>;

type SequenceConfig<T extends SequenceFieldAry> = CustomConfig & {
  fields: T;
};

// Thanks https://stackoverflow.com/questions/56988970/tuple-to-object-in-typescript-via-generics
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type TupleToObject<T extends Readonly<[string, any]>> = {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  [K in T[0]]: Extract<T, [K, any]>[1];
};

type SequenceFieldsReturnTypeTuple<T extends SequenceFieldAry> = {
  [P in keyof T]: [T[P]["name"], ReturnType<T[P]["schema"]["decode"]>];
};

type SequenceFieldsReturnType<T extends SequenceFieldAry> = TupleToObject<
  SequenceFieldsReturnTypeTuple<T>[number]
>;

export const sequence = <T extends SequenceFieldAry>(
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
    value: v.tuple(
      config.fields.map((f) => f.schema._valibot.asn1Schema) as [
        v.BaseSchema,
        ...v.BaseSchema[],
      ],
    ),
  });
  const _nativeSchema = v.object(
    Object.fromEntries(
      config.fields.map(
        (f) =>
          [f.name, f.schema._valibot.nativeSchema] as [string, v.BaseSchema],
      ),
    ),
  );
  return new (class SequenceSchema<
    const T extends SequenceFieldAry,
  > extends BaseSchema<
    SequenceFieldsReturnType<T>,
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
      const obj: SequenceFieldsReturnType<T> = {} as any;
      for (let i = 0; i < parsedData.value.length; i++) {
        const field = this.fields[i];
        obj[field.name as keyof SequenceFieldsReturnType<T>] =
          field.schema.decode(parsedData.value[i]);
      }
      return obj;
    }

    encode(data: SequenceFieldsReturnType<T>) {
      const parsedData = v.parse(
        this._valibot.nativeSchema,
        data,
      ) as SequenceFieldsReturnType<T>;
      const uint8AryFields: Uint8Array[] = [];
      for (const field of this.fields) {
        const res = field.schema.encode(
          parsedData[field.name as keyof SequenceFieldsReturnType<T>],
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
