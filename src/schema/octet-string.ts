import * as v from "valibot";
import { Asn1Data } from "..";
import { TagClass, UniversalClassTag } from "../const";
import { BaseSchema, CustomConfig } from "./base";
import { idSchemaFactory } from "../utils/schema";

export class OctetStringSchema extends BaseSchema<string> {
  valibotSchema: v.BaseSchema;
  tagClass: TagClass = TagClass.UNIVERSAL;
  tagType: number = UniversalClassTag.OCTET_STRING;

  constructor(config: CustomConfig = {}) {
    super();
    if (config.tagClass) this.tagClass = config.tagClass;
    if (config.tagType) this.tagType = config.tagType;
    this.valibotSchema = v.object({
      id: idSchemaFactory({
        tagClass: this.tagClass,
        isConstructed: false,
        tagType: this.tagType,
      }),
      len: v.number([v.minValue(0)]),
      value: v.instance(Uint8Array),
    });
  }

  decode(asnData: Asn1Data) {
    const res = v.parse(this.valibotSchema, asnData);
    return new TextDecoder().decode(res.value);
  }

  encode(data: string) {
    const value = new Uint8Array(Buffer.from(data, "ascii"));
    let uint8Ary = Uint8Array.from([
      (this.tagClass << 6) + (0 << 5) + this.tagType,
      value.length,
    ]);
    uint8Ary = Buffer.concat([uint8Ary, value]);
    return uint8Ary;
  }
}

export const octetString = (config?: CustomConfig) =>
  new OctetStringSchema(config);
