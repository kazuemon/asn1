import * as v from "valibot";
import { Asn1Data } from "..";
import { TagClass, UniversalClassTag } from "../const";
import { pad0Hex } from "../utils";
import { BaseSchema, CustomConfig } from "./base";
import { idSchemaFactory } from "../utils/schema";

export class IntegerSchema extends BaseSchema<number> {
  valibotSchema: v.BaseSchema;
  tagClass: TagClass = TagClass.UNIVERSAL;
  tagType: number = UniversalClassTag.INTEGER;

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
    return Buffer.from(res.value).readUintBE(0, res.value.length);
  }

  encode(data: number) {
    const value = new Uint8Array(
      Buffer.from(pad0Hex(data.toString(16)), "hex"),
    );
    let uint8Ary = Uint8Array.from([
      (this.tagClass << 6) + (0 << 5) + this.tagType,
      value.length,
    ]);
    uint8Ary = Buffer.concat([uint8Ary, value]);
    return uint8Ary;
  }
}

export const integer = (config?: CustomConfig) => new IntegerSchema(config);
