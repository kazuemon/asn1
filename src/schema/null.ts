import * as v from "valibot";
import { TagClass, UniversalClassTag } from "../const";
import {
  Identifier,
  IdentifierSettledBaseSchema,
  OverrideIdentifierConfig,
} from "./base";

export class NullSchema<
  TClass extends TagClass = typeof TagClass.UNIVERSAL,
  TType extends number = typeof UniversalClassTag.NULL,
> extends IdentifierSettledBaseSchema<null, TClass, TType, false> {
  protected nativeSchema;

  constructor({
    tagClass = TagClass.UNIVERSAL,
    tagType = UniversalClassTag.NULL,
  }: OverrideIdentifierConfig<TClass, TType> = {}) {
    super(
      {
        tagClass: tagClass as TClass,
        tagType: tagType as TType,
        isConstructed: false,
      },
      v.instance(Uint8Array),
      v.literal(0),
    );
    this.nativeSchema = v.null_();
  }

  changeIdentifier<
    NewTClass extends TagClass = TClass,
    NewTType extends number = TType,
  >(
    newIdentifier: Partial<
      Identifier<TagClass | NewTClass, number | NewTType, false>
    > = this.getIdentifier(),
  ) {
    return new NullSchema(newIdentifier);
  }

  decodeValue(_data: Uint8Array): null {
    return null;
  }

  encodeValue(_obj: null): Uint8Array {
    return new Uint8Array();
  }
}

export const null_ = <
  TClass extends TagClass = typeof TagClass.UNIVERSAL,
  TType extends number = typeof UniversalClassTag.NULL,
>(
  config: OverrideIdentifierConfig<TClass, TType> = {},
) => new NullSchema(config);
