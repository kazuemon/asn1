import * as v from "valibot";
import { TagClass, UniversalClassTag } from "../const";
import { BaseSchema, SchemaConfig, ValibotSchemaPair } from "./base";
import { idSchemaFactory } from "../utils/schema";
import { Asn1Data } from "..";

const defaultConfig: SchemaConfig = {
  tagClass: TagClass.UNIVERSAL,
  tagType: UniversalClassTag.NULL,
};

export const null_ = (_config = {} as Partial<SchemaConfig>) => {
  const { tagClass, tagType } = { ...defaultConfig, ..._config };
  const _asn1Schema = v.object({
    id: idSchemaFactory({
      tagClass,
      isConstructed: false,
      tagType,
    }),
    len: v.literal(0),
    value: v.instance(Uint8Array),
  });
  const _nativeSchema = v.null_();
  return new (class NullSchema
    implements BaseSchema<null, typeof _asn1Schema, typeof _nativeSchema>
  {
    valibotSchema: ValibotSchemaPair<typeof _asn1Schema, typeof _nativeSchema> =
      {
        asn1Schema: _asn1Schema,
        nativeSchema: _nativeSchema,
      };
    tagClass = tagClass;
    tagType = tagType;

    decode(asnData: Asn1Data) {
      const res = v.parse(this.valibotSchema.asn1Schema, asnData);
      return null;
    }

    encode(data: null) {
      const parsedData = v.parse(this.valibotSchema.nativeSchema, data);
      const value = new Uint8Array();
      let uint8Ary = Uint8Array.from([
        (this.tagClass << 6) + (0 << 5) + this.tagType,
        value.length,
      ]);
      uint8Ary = Buffer.concat([uint8Ary, value]);
      return uint8Ary;
    }
  })();
};
