import * as v from "valibot";
import { Asn1Data } from "..";
import { TagClass, UniversalClassTag } from "../const";
import { BaseSchema, CustomConfig, ValibotSchemaPair } from "./base";
import { idSchemaFactory } from "../utils/schema";

export const octetString = (config?: CustomConfig) => {
  const _tagClass = config?.tagClass ?? TagClass.UNIVERSAL;
  const _tagType: number = config?.tagType ?? UniversalClassTag.OCTET_STRING;
  const _asn1Schema = v.object({
    id: idSchemaFactory({
      tagClass: _tagClass,
      isConstructed: false,
      tagType: _tagType,
    }),
    len: v.number([v.minValue(0)]),
    value: v.instance(Uint8Array),
  });
  const _nativeSchema = v.string();
  return new (class OctetStringSchema
    implements BaseSchema<string, typeof _asn1Schema, typeof _nativeSchema>
  {
    valibotSchema: ValibotSchemaPair<typeof _asn1Schema, typeof _nativeSchema> =
      {
        asn1Schema: _asn1Schema,
        nativeSchema: _nativeSchema,
      };
    tagClass = _tagClass;
    tagType = _tagType;

    decode(asnData: Asn1Data) {
      const parsedData = v.parse(this.valibotSchema.asn1Schema, asnData);
      return new TextDecoder().decode(parsedData.value);
    }

    encode(data: string) {
      const parsedData = v.parse(this.valibotSchema.nativeSchema, data);
      const value = new Uint8Array(Buffer.from(parsedData, "ascii"));
      let uint8Ary = Uint8Array.from([
        (this.tagClass << 6) + (0 << 5) + this.tagType,
        value.length,
      ]);
      uint8Ary = Buffer.concat([uint8Ary, value]);
      return uint8Ary;
    }
  })();
};
