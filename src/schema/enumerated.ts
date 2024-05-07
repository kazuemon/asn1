import * as v from "valibot";
import { BaseSchema } from "valibot";
import { TagClass, UniversalClassTag } from "../const";
import {
  Identifier,
  IdentifierSettledBaseSchema,
  OverrideIdentifierConfig,
} from "./base";
import { pad0Hex } from "../utils";

type EnumType = Record<string, number>;

type EnumConfig<
  Enums extends EnumType,
  TClass extends TagClass,
  TType extends number,
> = OverrideIdentifierConfig<TClass, TType> & {
  enums: Enums;
};

export class EnumeratedSchema<
  const Enums extends EnumType,
  TClass extends TagClass = typeof TagClass.UNIVERSAL,
  TType extends number = typeof UniversalClassTag.ENUMERATED,
> extends IdentifierSettledBaseSchema<
  Enums[keyof Enums],
  TClass,
  TType,
  false
> {
  private enums;
  protected nativeSchema: BaseSchema;

  constructor({
    enums,
    tagClass = TagClass.UNIVERSAL,
    tagType = UniversalClassTag.ENUMERATED,
  }: EnumConfig<Enums, TClass, TType>) {
    super(
      {
        tagClass: tagClass as TClass,
        tagType: tagType as TType,
        isConstructed: false,
      },
      v.instance(Uint8Array),
    );
    this.enums = enums;
    this.nativeSchema = v.number();
  }

  changeIdentifier<
    NewTClass extends TagClass = TClass,
    NewTType extends number = TType,
  >(
    newIdentifier: Partial<
      Identifier<TagClass | NewTClass, number | NewTType, false>
    > = this.getIdentifier(),
  ) {
    return new EnumeratedSchema({ ...newIdentifier, enums: this.enums });
  }

  decodeValue(data: Uint8Array): Enums[keyof Enums] {
    return Buffer.from(data).readUintBE(0, data.length) as Enums[keyof Enums];
  }

  encodeValue(obj: Enums[keyof Enums]): Uint8Array {
    return new Uint8Array(Buffer.from(pad0Hex(obj.toString(16)), "hex"));
  }
}

export const enumerated = <
  const Enums extends EnumType,
  TClass extends TagClass = typeof TagClass.UNIVERSAL,
  TType extends number = typeof UniversalClassTag.ENUMERATED,
>(
  config: EnumConfig<Enums, TClass, TType>,
) => new EnumeratedSchema(config);
