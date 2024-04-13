import * as v from "valibot";
import { TagClass, UniversalClassTag } from "../const";
import { BaseSchema, CustomConfig, ValibotSchemaPair } from "./base";
import { idSchemaFactory } from "../utils/schema";
import { Asn1Data } from "..";
import { pad0Hex } from "../utils";

export const boolean = (config?: CustomConfig) => {
  const _tagClass = config?.tagClass ?? TagClass.UNIVERSAL;
  const _tagType: number = config?.tagType ?? UniversalClassTag.BOOLEAN;
  const _asn1Schema = v.object({
    id: idSchemaFactory({
      tagClass: _tagClass,
      isConstructed: false,
      tagType: _tagType,
    }),
    len: v.number([v.minValue(0)]),
    value: v.instance(Uint8Array),
  });
  const _nativeSchema = v.boolean();
  return new (class BooleanSchema
    implements BaseSchema<boolean, typeof _asn1Schema, typeof _nativeSchema>
  {
    valibotSchema: ValibotSchemaPair<typeof _asn1Schema, typeof _nativeSchema> =
      {
        asn1Schema: _asn1Schema,
        nativeSchema: _nativeSchema,
      };
    tagClass = _tagClass;
    tagType = _tagType;

    decode(asnData: Asn1Data) {
      const res = v.parse(this.valibotSchema.asn1Schema, asnData);
      return Buffer.from(res.value).readUintBE(0, res.value.length) > 0;
    }

    encode(data: boolean) {
      const parsedData = v.parse(this.valibotSchema.nativeSchema, data);
      const value = new Uint8Array(
        Buffer.from(pad0Hex((parsedData ? 1 : 0).toString(16)), "hex"),
      );
      let uint8Ary = Uint8Array.from([
        (this.tagClass << 6) + (0 << 5) + this.tagType,
        value.length,
      ]);
      uint8Ary = Buffer.concat([uint8Ary, value]);
      return uint8Ary;
    }
  })();
};
