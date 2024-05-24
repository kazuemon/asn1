import * as v from "valibot";
import type { TagClass } from "../const";
import type { Asn1Data } from "../types";
import {
  type BaseSchema,
  type IdentifierSettledBaseSchema,
  SchemaMismatchError,
} from "./base";

export type BERInputDataByIdentifier<
  TSType,
  TClass extends TagClass,
  TType extends number,
> = {
  tagClass: TClass;
  tagType: TType;
  value: TSType;
};

export type BERInputDataByName<TSType, Name extends string> = {
  name: Name;
  value: TSType;
};

export type BERData<
  TSType,
  Name extends string,
  TClass extends TagClass,
  TType extends number,
> = {
  name: Name;
  tagClass: TClass;
  tagType: TType;
  value: TSType;
};

type ChoiceItem<ToType, FromType> = Readonly<{
  name: string;
  schema: BaseSchema<ToType, FromType>;
}>;

type AnyChoiceItem = ChoiceItem<any, any>;

type ChoiceItemAry = Readonly<[AnyChoiceItem, ...AnyChoiceItem[]]>;

type OtherChoiceItemIndexTuple<
  T extends ChoiceItemAry,
  K extends number | `${number}`,
> = Exclude<Extract<keyof T, `${number}`>, `${K}`>;

type GetIdentifierPair<T extends BaseSchema<any, any>> =
  T extends IdentifierSettledBaseSchema<
    any,
    infer TClass,
    infer TType,
    infer __
  >
    ? [TClass, TType]
    : T extends ChoiceSchema<infer Items>
      ? AllChoiceItemsIdentifierPairUnion<Items>
      : never;

type AllChoiceItemsIdentifierPairUnion<T extends ChoiceItemAry> = {
  [P in keyof T]: GetIdentifierPair<T[P]["schema"]>;
}[number];

type ExpandIdentifierPair<T> = T extends [number, number]
  ? {
      tagClass: T[0];
      tagType: T[1];
    }
  : never;

type UniqueCheckedChoiceItemAry<T extends ChoiceItemAry> = {
  [K in keyof T]: OtherChoiceItemIndexTuple<T, K> extends never
    ? T[K]
    : GetIdentifierPair<T[K]["schema"]> extends GetIdentifierPair<
          T[OtherChoiceItemIndexTuple<T, K>]["schema"]
        >
      ? {
          schema: {
            error: "Identifier Duplicated";
            duplicated_identifier: ExpandIdentifierPair<
              Extract<
                GetIdentifierPair<T[K]["schema"]>,
                GetIdentifierPair<T[OtherChoiceItemIndexTuple<T, K>]["schema"]>
              >
            >;
          };
        }
      : GetIdentifierPair<
            T[OtherChoiceItemIndexTuple<T, K>]["schema"]
          > extends GetIdentifierPair<T[K]["schema"]>
        ? {
            schema: {
              error: "Identifier Duplicated";
              duplicated_identifier: ExpandIdentifierPair<
                Extract<
                  GetIdentifierPair<T[K]["schema"]>,
                  GetIdentifierPair<
                    T[OtherChoiceItemIndexTuple<T, K>]["schema"]
                  >
                >
              >;
            };
          }
        : T[K]["schema"] extends ChoiceSchema<infer Items>
          ? {
              name: T[K]["name"];
              schema: ChoiceSchema<UniqueCheckedChoiceItemAry<Items>>;
            }
          : T[K];
};

type AllChoiceItemsParsedUnion<
  T extends ChoiceItemAry,
  OverrideTClass extends TagClass = never,
  OverrideTType extends number = never,
> = {
  [P in keyof T]: T[P]["schema"] extends IdentifierSettledBaseSchema<
    infer TSType,
    infer TClass,
    infer TType,
    infer _
  >
    ? BERData<
        TSType,
        T[P]["name"],
        OverrideTClass extends never ? TClass : OverrideTClass,
        OverrideTType extends never ? TType : OverrideTType
      >
    : T[P]["schema"] extends ChoiceSchema<infer Items>
      ? {
          name: T[P]["name"];
          value: AllChoiceItemsParsedUnion<Items>;
        }
      : never;
}[number];

type AllChoiceItemsInputUnion<
  T extends ChoiceItemAry,
  OverrideTClass extends TagClass = never,
  OverrideTType extends number = never,
> = {
  [P in keyof T]: T[P]["schema"] extends IdentifierSettledBaseSchema<
    infer TSType,
    infer TClass,
    infer TType,
    infer _
  >
    ?
        | BERInputDataByName<TSType, T[P]["name"]>
        | BERInputDataByIdentifier<
            TSType,
            OverrideTClass extends never ? TClass : OverrideTClass,
            OverrideTType extends never ? TType : OverrideTType
          >
    : T[P]["schema"] extends ChoiceSchema<infer Items>
      ? {
          name: T[P]["name"];
          value: AllChoiceItemsInputUnion<Items>;
        }
      : never;
}[number];

type ChoiceConfig<
  T extends ChoiceItemAry,
  OverrideTClass extends TagClass = never,
  OverrideTType extends number = never,
> = {
  fields: UniqueCheckedChoiceItemAry<T>;
  overrideTagClass?: OverrideTClass;
  overrideTagType?: OverrideTType;
};

export class ChoiceSchema<
  const T extends ChoiceItemAry,
  OverrideTClass extends TagClass = never,
  OverrideTType extends number = never,
> implements
    BaseSchema<
      AllChoiceItemsParsedUnion<T, OverrideTClass, OverrideTType>,
      AllChoiceItemsInputUnion<T, OverrideTClass, OverrideTType>
    >
{
  private fields;
  private asn1Schema;
  private nativeSchema;

  private overrideTClass;
  private overrideTType;

  constructor({
    fields,
    overrideTagClass,
    overrideTagType,
  }: ChoiceConfig<T, OverrideTClass, OverrideTType>) {
    // TODO: fields schema runtime check
    this.fields = fields;
    this.overrideTType = overrideTagType;
    this.overrideTClass = overrideTagClass;
    this.asn1Schema = v.union(
      this.fields.map((field) => {
        const schema = field.schema.getAsn1Schema() as v.ObjectSchema<any>;
        if (!overrideTagClass && !overrideTagType) return schema;
        return v.object({
          ...schema.entries,
          id: v.object({
            tagClass: v.literal(
              this.overrideTClass ?? schema.entries.id.entries.tagClass,
            ),
            tagType: v.literal(
              this.overrideTType ?? schema.entries.id.entries.tagType,
            ),
            isConstructed: schema.entries.id.isConstructed,
          }),
        });
      }),
    );
    this.nativeSchema = v.union(
      this.fields.map((field) =>
        v.union([
          v.object({
            name: v.literal(field.name),
            value: field.schema.getNativeSchema(),
          }),
        ]),
      ),
    );
  }

  getAsn1Schema(): v.BaseSchema {
    return this.asn1Schema;
  }

  getNativeSchema(): v.BaseSchema {
    return this.nativeSchema;
  }

  overrideIdentifier<
    NewOverrideTClass extends TagClass = OverrideTClass,
    NewOverrideTType extends number = OverrideTType,
  >({
    newTagClass = this.overrideTClass,
    newTagType = this.overrideTType,
  }: {
    newTagClass: NewOverrideTClass | TagClass | undefined;
    newTagType: NewOverrideTType | number | undefined;
  }) {
    return new ChoiceSchema({
      fields: this.fields,
      overrideTagClass: newTagClass,
      overrideTagType: newTagType,
    });
  }

  decode(
    data: Asn1Data,
  ): AllChoiceItemsParsedUnion<T, OverrideTClass, OverrideTType> {
    const result = v.safeParse(this.asn1Schema, data);
    if (!result.success) throw new SchemaMismatchError();
    const id = result.output.id;
    for (const field of this.fields) {
      try {
        return {
          name: field.name,
          tagClass: id.tagClass,
          tagType: id.tagType,
          value: field.schema.decode(result.output as any),
        } as AllChoiceItemsParsedUnion<T, OverrideTClass, OverrideTType>;
      } catch (e) {
        if (e instanceof SchemaMismatchError) continue;
        throw e;
      }
    }
    throw new SchemaMismatchError();
  }

  encode(
    obj: AllChoiceItemsInputUnion<T, OverrideTClass, OverrideTType>,
  ): Uint8Array {
    const result = v.safeParse(this.nativeSchema, obj);
    if (!result.success) throw new SchemaMismatchError();
    if ("name" in obj) {
      // Named
      const field = this.fields.find((field) => field.name === obj.name);
      if (!field) throw new SchemaMismatchError();
      return field.schema.encode(obj.value);
    }
    for (const field of this.fields) {
      try {
        return field.schema.encode(obj.value);
      } catch (e) {
        if (e instanceof SchemaMismatchError) continue;
        throw e;
      }
    }
    throw new SchemaMismatchError();
  }
}

export const choice = <
  const T extends ChoiceItemAry,
  OverrideTClass extends TagClass = never,
  OverrideTType extends number = never,
>(
  config: ChoiceConfig<T, OverrideTClass, OverrideTType>,
) => new ChoiceSchema(config);
