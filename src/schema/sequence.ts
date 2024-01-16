import * as v from "valibot";
import { Asn1Data } from "..";
import { TagClass, UniversalClassTag } from "../const";
import { idSchemaFactory } from "../utils/schema";
import { BaseSchema, CustomConfig } from "./base";

type SequenceField<T> = Readonly<{
  name: string;
  schema: BaseSchema<T>;
}>;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type SequenceFieldAry = Readonly<[SequenceField<any>, ...SequenceField<any>[]]>;

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

export class SequenceSchema<
  const T extends SequenceFieldAry,
> extends BaseSchema<SequenceFieldsReturnType<T>> {
  valibotSchema;
  tagClass: TagClass = TagClass.UNIVERSAL;
  tagType: number = UniversalClassTag.SEQUENCE_AND_SEQUENCE_OF;

  constructor(private config: SequenceConfig<T>) {
    super();
    this.valibotSchema = v.object({
      id: idSchemaFactory({
        tagClass: this.tagClass,
        isConstructed: true,
        tagType: this.tagType,
      }),
      len: v.number([v.minValue(0)]),
      value: v.tuple(
        config.fields.map((f) => f.schema.valibotSchema) as [
          v.BaseSchema,
          ...v.BaseSchema[],
        ],
      ),
    });
  }

  decode(asnData: Asn1Data) {
    const res = v.parse(this.valibotSchema, asnData);
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const obj: SequenceFieldsReturnType<T> = {} as any;
    for (let i = 0; i < res.value.length; i++) {
      const field = this.config.fields[i];
      obj[field.name as keyof SequenceFieldsReturnType<T>] =
        field.schema.decode(res.value[i]);
    }
    return obj;
  }

  encode(data: SequenceFieldsReturnType<T>) {
    const uint8AryFields: Uint8Array[] = [];
    // FIXME: Add validation
    for (const field of this.config.fields) {
      const res = field.schema.encode(
        data[field.name as keyof SequenceFieldsReturnType<T>],
      );
      console.log({ name: field.name, encoded: res });
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
}

export const sequence = <T extends SequenceFieldAry>(
  config: SequenceConfig<T>,
) => new SequenceSchema(config);
