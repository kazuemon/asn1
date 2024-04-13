import * as v from "valibot";
import { TagClass, UniversalClassTag } from "../const";
import { BaseSchema, SchemaConfig, ValibotSchemaPair } from "./base";
import { idSchemaFactory } from "../utils/schema";
import { Asn1Data } from "..";
import { pad0Hex } from "../utils";

const defaultConfig: SchemaConfig = {
  tagClass: TagClass.UNIVERSAL,
  tagType: UniversalClassTag.BOOLEAN,
};

export const boolean = (_config = {} as Partial<SchemaConfig>) => {
  const { tagClass, tagType } = { ...defaultConfig, ..._config };
  const _asn1Schema = v.object({
    id: idSchemaFactory({
      tagClass,
      isConstructed: false,
      tagType,
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
    tagClass = tagClass;
    tagType = tagType;

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
