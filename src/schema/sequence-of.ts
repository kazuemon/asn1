import * as v from "valibot";
import { TagClass, UniversalClassTag } from "../const";
import {
  BaseSchema,
  Identifier,
  IdentifierSettledBaseSchema,
  OverrideIdentifierConfig,
} from "./base";
import { Asn1Data } from "..";

type SequenceOfConfig<
  FSchema extends BaseSchema<any, any>,
  TClass extends TagClass,
  TType extends number,
> = OverrideIdentifierConfig<TClass, TType> & {
  fieldSchema: FSchema;
};

type SequenceOfTSType<FSchema extends BaseSchema<any, any>> = ReturnType<
  FSchema["decode"]
>[];

export class SequenceOfSchema<
  FSchema extends BaseSchema<any, any>,
  TClass extends TagClass = typeof TagClass.UNIVERSAL,
  TType extends number = typeof UniversalClassTag.SEQUENCE_AND_SEQUENCE_OF,
> extends IdentifierSettledBaseSchema<
  SequenceOfTSType<FSchema>,
  TClass,
  TType,
  true
> {
  private fieldSchema;
  protected nativeSchema;

  constructor({
    fieldSchema,
    tagClass = TagClass.UNIVERSAL,
    tagType = UniversalClassTag.SEQUENCE_AND_SEQUENCE_OF,
  }: SequenceOfConfig<FSchema, TClass, TType>) {
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
    return new SequenceOfSchema({
      ...newIdentifier,
      fieldSchema: this.fieldSchema,
    });
  }

  decodeValue(data: Asn1Data[]): SequenceOfTSType<FSchema> {
    const ary: SequenceOfTSType<FSchema> = [];
    for (const field of data) {
      ary.push(this.fieldSchema.decode(field));
    }
    return ary;
  }

  encodeValue(obj: SequenceOfTSType<FSchema>): Uint8Array {
    const uint8AryFields: Uint8Array[] = [];
    for (const field of obj) {
      uint8AryFields.push(this.fieldSchema.encode(field));
    }
    return Buffer.concat(uint8AryFields);
  }
}

export const sequenceOf = <
  FSchema extends BaseSchema<any, any>,
  TClass extends TagClass = typeof TagClass.UNIVERSAL,
  TType extends number = typeof UniversalClassTag.SEQUENCE_AND_SEQUENCE_OF,
>(
  config: SequenceOfConfig<FSchema, TClass, TType>,
) => new SequenceOfSchema(config);
