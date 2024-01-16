import * as v from "valibot";
import { Asn1Data } from "..";
import { TagClass, UniversalClassTag } from "../const";

export type CustomConfig = {
  tagClass?: TagClass;
  tagType?: UniversalClassTag;
};

export abstract class BaseSchema<TSType> {
  abstract tagClass: TagClass;
  abstract tagType: number;
  abstract valibotSchema: v.BaseSchema;
  abstract decode(asnData: Asn1Data): TSType;
  abstract encode(data: TSType): Uint8Array;
}
