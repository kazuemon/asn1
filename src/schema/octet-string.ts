import * as v from "valibot";
import { TagClass, UniversalClassTag } from "../const";
import { IdentifierSettledBaseSchema, OverrideIdentifierConfig } from "./base";

export class OctetStringSchema<
  TClass extends TagClass = typeof TagClass.UNIVERSAL,
  TType extends number = typeof UniversalClassTag.OCTET_STRING,
> extends IdentifierSettledBaseSchema<string, TClass, TType, false> {
  protected nativeSchema;
  private textDecoder = new TextDecoder();

  constructor({
    tagClass = TagClass.UNIVERSAL,
    tagType = UniversalClassTag.OCTET_STRING,
  }: OverrideIdentifierConfig<TClass, TType> = {}) {
    super(
      {
        tagClass: tagClass as TClass,
        tagType: tagType as TType,
        isConstructed: false,
      },
      v.instance(Uint8Array),
    );
    this.nativeSchema = v.string();
  }

  decodeValue(data: Uint8Array): string {
    return this.textDecoder.decode(data);
  }

  encodeValue(obj: string): Uint8Array {
    return new Uint8Array(Buffer.from(obj, "ascii"));
  }
}

export const octetString = <
  TClass extends TagClass = typeof TagClass.UNIVERSAL,
  TType extends number = typeof UniversalClassTag.OCTET_STRING,
>(
  config: OverrideIdentifierConfig<TClass, TType> = {},
) => new OctetStringSchema(config);
