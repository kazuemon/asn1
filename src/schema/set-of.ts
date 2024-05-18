import * as v from "valibot";
import { TagClass, UniversalClassTag } from "../const";
import type { Asn1Data } from "../types";
import {
  type BaseSchema,
  type Identifier,
  IdentifierSettledBaseSchema,
  type OverrideIdentifierConfig,
} from "./base";

type SetOfConfig<
  FSchema extends BaseSchema<any, any>,
  TClass extends TagClass,
  TType extends number,
> = OverrideIdentifierConfig<TClass, TType> & {
  fieldSchema: FSchema;
};

type SetOfTSType<FSchema extends BaseSchema<any, any>> = ReturnType<
  FSchema["decode"]
>[];

export class SetOfSchema<
  FSchema extends BaseSchema<any, any>,
  TClass extends TagClass = typeof TagClass.UNIVERSAL,
  TType extends number = typeof UniversalClassTag.SET_AND_SET_OF,
> extends IdentifierSettledBaseSchema<
  SetOfTSType<FSchema>,
  TClass,
  TType,
  true
> {
  private fieldSchema;
  protected nativeSchema;

  constructor({
    fieldSchema,
    tagClass = TagClass.UNIVERSAL,
    tagType = UniversalClassTag.SET_AND_SET_OF,
  }: SetOfConfig<FSchema, TClass, TType>) {
    super(
      {
        tagClass: tagClass as TClass,
        tagType: tagType as TType,
        isConstructed: true,
      },
      v.array(fieldSchema.getAsn1Schema()),
    );
    this.fieldSchema = fieldSchema;
    this.nativeSchema = v.array(fieldSchema.getNativeSchema());
  }

  changeIdentifier<
    NewTClass extends TagClass = TClass,
    NewTType extends number = TType,
  >(
    newIdentifier: Partial<
      Identifier<TagClass | NewTClass, number | NewTType, true>
    > = this.getIdentifier(),
  ) {
    return new SetOfSchema({
      ...newIdentifier,
      fieldSchema: this.fieldSchema,
    });
  }

  decodeValue(data: Asn1Data[]): SetOfTSType<FSchema> {
    const ary: SetOfTSType<FSchema> = [];
    for (const field of data) {
      ary.push(this.fieldSchema.decode(field));
    }
    return ary;
  }

  encodeValue(obj: SetOfTSType<FSchema>): Uint8Array {
    const uint8AryFields: Uint8Array[] = [];
    for (const field of obj) {
      uint8AryFields.push(this.fieldSchema.encode(field));
    }
    return Buffer.concat(uint8AryFields);
  }
}

export const setOf = <
  FSchema extends BaseSchema<any, any>,
  TClass extends TagClass = typeof TagClass.UNIVERSAL,
  TType extends number = typeof UniversalClassTag.SET_AND_SET_OF,
>(
  config: SetOfConfig<FSchema, TClass, TType>,
) => new SetOfSchema(config);
