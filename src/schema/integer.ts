import * as v from "valibot";
import { TagClass, UniversalClassTag } from "../const";
import { pad0Hex } from "../utils";
import { IdentifierSettledBaseSchema, OverrideIdentifierConfig } from "./base";

export class IntegerSchema<
  TClass extends TagClass = typeof TagClass.UNIVERSAL,
  TType extends number = typeof UniversalClassTag.INTEGER,
> extends IdentifierSettledBaseSchema<number, TClass, TType, false> {
  protected nativeSchema;

  constructor({
    tagClass = TagClass.UNIVERSAL,
    tagType = UniversalClassTag.INTEGER,
  }: OverrideIdentifierConfig<TClass, TType> = {}) {
    super(
      {
        tagClass: tagClass as TClass,
        tagType: tagType as TType,
        isConstructed: false,
      },
      v.instance(Uint8Array),
    );
    this.nativeSchema = v.number();
  }

  decodeValue(data: Uint8Array): number {
    return Buffer.from(data).readUintBE(0, data.length);
  }

  encodeValue(obj: number): Uint8Array {
    return new Uint8Array(Buffer.from(pad0Hex(obj.toString(16)), "hex"));
  }
}

export const integer = <
  TClass extends TagClass = typeof TagClass.UNIVERSAL,
  TType extends number = typeof UniversalClassTag.INTEGER,
>(
  config: OverrideIdentifierConfig<TClass, TType> = {},
) => new IntegerSchema(config);
