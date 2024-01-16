import * as v from "valibot";
import { Asn1Data } from "..";

export abstract class BaseSchema<TSType> {
  abstract valibotSchema: v.BaseSchema;
  abstract decode(asnData: Asn1Data): TSType;
  abstract encode(data: TSType): Uint8Array;
}
