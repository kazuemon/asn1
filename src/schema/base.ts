import * as v from "valibot";
import { Asn1Data } from "..";
import { TagClass, UniversalClassTag } from "../const";

export type CustomConfig = {
  tagClass?: TagClass;
  tagType?: UniversalClassTag;
};

export type ValibotSchemaPair<
  Asn1Schema extends v.BaseSchema,
  NativeSchema extends v.BaseSchema,
> = {
  asn1Schema: Asn1Schema;
  nativeSchema: NativeSchema;
};

export interface BaseSchema<
  TSType,
  Asn1Schema extends v.BaseSchema,
  NativeSchema extends v.BaseSchema,
> {
  tagClass: TagClass;
  tagType: number;
  valibotSchema: ValibotSchemaPair<Asn1Schema, NativeSchema>;
  decode(asnData: Asn1Data): TSType;
  encode(data: TSType): Uint8Array;
}
