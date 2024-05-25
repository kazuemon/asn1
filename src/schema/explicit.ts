import * as v from "valibot";
import type { TagClass } from "../const";
import type { Asn1Data } from "../types";
import { getLengthOctetAry } from "../utils";
import { type BaseSchema, SchemaMismatchError } from "./base";

type ExplicitConfig<
  TClass extends TagClass,
  TType extends number,
  Schema extends BaseSchema<any, any>,
> = {
  tagClass: TClass | TagClass;
  tagType: TType | number;
  wrappedSchema: Schema;
};

export class ExplicitSchema<
  TClass extends TagClass,
  TType extends number,
  Schema extends BaseSchema<any, any>,
> implements
    BaseSchema<ReturnType<Schema["decode"]>, ReturnType<Schema["encode"]>>
{
  private wrappedSchema;

  private tagClass;
  private tagType;

  protected asn1Schema;
  protected nativeSchema;

  constructor(config: ExplicitConfig<TClass, TType, Schema>) {
    this.asn1Schema = v.object({
      id: v.object({
        tagClass: v.literal(config.tagClass),
        isConstructed: v.literal(true),
        tagType: v.literal(config.tagType),
      }),
      len: v.number([v.minValue(0)]),
      value: v.tuple([config.wrappedSchema.getAsn1Schema()]),
    });
    this.tagClass = config.tagClass;
    this.tagType = config.tagType;
    this.wrappedSchema = config.wrappedSchema;
    this.nativeSchema = this.wrappedSchema.getNativeSchema();
  }

  getAsn1Schema() {
    return this.asn1Schema;
  }

  getNativeSchema() {
    return this.nativeSchema;
  }

  decode(data: Asn1Data): ReturnType<Schema["decode"]> {
    const result = v.safeParse(this.getAsn1Schema(), data);
    if (!result.success) throw new SchemaMismatchError();
    return this.wrappedSchema.decode(result.output.value[0]);
  }

  encode(obj: ReturnType<Schema["decode"]>): Uint8Array {
    const result = v.safeParse(this.nativeSchema, obj);
    if (!result.success) throw new SchemaMismatchError();
    const value = this.wrappedSchema.encode(result.output);
    return Buffer.concat([
      Uint8Array.from([
        (this.tagClass << 6) + 32 + this.tagType,
        ...getLengthOctetAry(value.length),
      ]),
      value,
    ]);
  }
}

export const explicit = <
  TClass extends TagClass,
  TType extends number,
  Schema extends BaseSchema<any, any>,
>(
  config: ExplicitConfig<TClass, TType, Schema>,
) => new ExplicitSchema(config);
