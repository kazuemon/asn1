import * as v from "valibot";
import { TagClass, UniversalClassTag } from "../const";
import { pad0Hex } from "../utils";
import {
  type Identifier,
  IdentifierSettledBaseSchema,
  type OverrideIdentifierConfig,
} from "./base";

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

  changeIdentifier<
    NewTClass extends TagClass = TClass,
    NewTType extends number = TType,
  >(
    newIdentifier: Partial<
      Identifier<TagClass | NewTClass, number | NewTType, false>
    > = this.getIdentifier(),
  ) {
    return new BooleanSchema(newIdentifier);
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
