import * as v from "valibot";
import { Asn1Data } from "..";
import { TagClass, UniversalClassTag } from "../const";

export type CustomConfig = {
  tagClass?: TagClass;
  tagType?: UniversalClassTag;
};

export type ValibotSchema<
  Asn1Schema extends v.BaseSchema,
  NativeSchema extends v.BaseSchema,
> = {
  asn1Schema: Asn1Schema;
  nativeSchema: NativeSchema;
};

export abstract class BaseSchema<
  TSType,
  Asn1Schema extends v.BaseSchema,
  NativeSchema extends v.BaseSchema,
> {
  abstract tagClass: TagClass;
  abstract tagType: number;
  abstract _valibot: ValibotSchema<Asn1Schema, NativeSchema>;
  abstract decode(asnData: Asn1Data): TSType;
  abstract encode(data: TSType): Uint8Array;
}
