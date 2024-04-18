import * as v from "valibot";
import { TagClass, UniversalClassTag } from "../const";
import { IdentifierSettledBaseSchema, OverrideIdentifierConfig } from "./base";
import { pad0Hex } from "../utils";

export class BooleanSchema<
  TClass extends TagClass = typeof TagClass.UNIVERSAL,
  TType extends number = typeof UniversalClassTag.BOOLEAN,
> extends IdentifierSettledBaseSchema<boolean, TClass, TType, false> {
  protected nativeSchema;

  constructor({
    tagClass = TagClass.UNIVERSAL,
    tagType = UniversalClassTag.BOOLEAN,
  }: OverrideIdentifierConfig<TClass, TType> = {}) {
    super(
      {
        tagClass: tagClass as TClass,
        tagType: tagType as TType,
        isConstructed: false,
      },
      v.instance(Uint8Array),
    );
    this.nativeSchema = v.boolean();
  }

  decodeValue(data: Uint8Array): boolean {
    return Buffer.from(data).readUintBE(0, data.length) > 0;
  }

  encodeValue(obj: boolean): Uint8Array {
    return new Uint8Array(
      Buffer.from(pad0Hex((obj ? 1 : 0).toString(16)), "hex"),
    );
  }
}

export const boolean = <
  TClass extends TagClass = typeof TagClass.UNIVERSAL,
  TType extends number = typeof UniversalClassTag.BOOLEAN,
>(
  config: OverrideIdentifierConfig<TClass, TType> = {},
) => new BooleanSchema(config);
