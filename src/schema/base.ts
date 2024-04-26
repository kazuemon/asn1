import * as v from "valibot";
import { Asn1Data } from "..";
import { TagClass } from "../const";

export class SchemaMismatchError extends Error {}

export interface BaseSchema<ToType, FromType> {
  getAsn1Schema(): v.BaseSchema;
  getNativeSchema(): v.BaseSchema;
  decode(data: Asn1Data): ToType;
  encode(obj: FromType): Uint8Array;
}

export type Identifier<
  TClass extends TagClass,
  TType extends number,
  IsConstructed extends boolean,
> = {
  tagClass: TClass;
  tagType: TType;
  isConstructed: IsConstructed;
};

export type IdentifierWithoutPC<
  TClass extends TagClass,
  TType extends number,
> = {
  tagClass: TClass;
  tagType: TType;
};

export type OverrideIdentifierConfig<
  TClass extends TagClass,
  TType extends number,
> = Partial<IdentifierWithoutPC<TClass | TagClass, TType | number>>;

export abstract class IdentifierSettledBaseSchema<
  TSType,
  TClass extends TagClass,
  TType extends number,
  IsConstructed extends boolean,
> implements BaseSchema<TSType, TSType>
{
  protected asn1Schema;
  protected abstract nativeSchema: v.BaseSchema;

  abstract decodeValue(
    data: IsConstructed extends true ? Asn1Data[] : Uint8Array,
  ): TSType;
  abstract encodeValue(obj: TSType): Uint8Array;

  constructor(
    private identifier: Identifier<TClass, TType, IsConstructed>,
    valueSchema: v.BaseSchema,
    lenSchema: v.BaseSchema = v.number([v.minValue(0)]),
  ) {
    this.asn1Schema = v.object({
      id: v.object({
        tagClass: v.literal(identifier.tagClass),
        isConstructed: v.literal(identifier.isConstructed),
        tagType: v.literal(identifier.tagType),
      }),
      len: lenSchema,
      value: valueSchema,
    });
  }

  abstract changeIdentifier<
    NewTClass extends TagClass = TClass,
    NewTType extends number = TType,
  >(
    newIdentifier: Partial<
      Identifier<NewTClass | TagClass, NewTType | number, IsConstructed>
    >,
  ): IdentifierSettledBaseSchema<TSType, NewTClass, NewTType, IsConstructed>;

  getIdentifier() {
    return this.identifier;
  }

  getAsn1Schema() {
    return this.asn1Schema;
  }

  getNativeSchema() {
    return this.nativeSchema;
  }

  decode(data: Asn1Data): TSType {
    const result = v.safeParse(this.asn1Schema, data);
    if (!result.success) throw new SchemaMismatchError();
    return this.decodeValue(result.output.value);
  }

  encode(obj: TSType): Uint8Array {
    const result = v.safeParse(this.nativeSchema, obj);
    if (!result.success) throw new SchemaMismatchError();
    const value = this.encodeValue(result.output);
    return Buffer.concat([
      Uint8Array.from([
        (this.identifier.tagClass << 6) +
          (+!!this.identifier.isConstructed << 5) +
          this.identifier.tagType,
        value.length,
      ]),
      value,
    ]);
  }
}
