import * as v from "valibot";
import { TagClass } from "../const";
import {
  BaseSchema,
  IdentifierSettledBaseSchema,
  SchemaMismatchError,
} from "./base";
import { Asn1Data } from "..";

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
    infer _,
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

type AllChoiceItemsParsedUnion<T extends ChoiceItemAry> = {
  [P in keyof T]: T[P]["schema"] extends IdentifierSettledBaseSchema<
    infer TSType,
    infer TClass,
    infer TType,
    infer _
  >
    ? BERData<TSType, T[P]["name"], TClass, TType>
    : T[P]["schema"] extends ChoiceSchema<infer Items>
      ? {
          name: T[P]["name"];
          value: AllChoiceItemsParsedUnion<Items>;
        }
      : never;
}[number];

type AllChoiceItemsInputUnion<T extends ChoiceItemAry> = {
  [P in keyof T]: T[P]["schema"] extends IdentifierSettledBaseSchema<
    infer TSType,
    infer TClass,
    infer TType,
    infer _
  >
    ?
        | BERInputDataByName<TSType, T[P]["name"]>
        | BERInputDataByIdentifier<TSType, TClass, TType>
    : T[P]["schema"] extends ChoiceSchema<infer Items>
      ? {
          name: T[P]["name"];
          value: AllChoiceItemsInputUnion<Items>;
        }
      : never;
}[number];

export class ChoiceSchema<const T extends ChoiceItemAry>
  implements
    BaseSchema<AllChoiceItemsParsedUnion<T>, AllChoiceItemsInputUnion<T>>
{
  private fields;
  private asn1Schema;
  private nativeSchema;

  constructor({ fields }: { fields: UniqueCheckedChoiceItemAry<T> }) {
    // TODO: fields schema runtime check
    this.fields = fields;
    this.asn1Schema = v.union(
      this.fields.map((field) => field.schema.getAsn1Schema()),
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

  decode(data: Asn1Data): AllChoiceItemsParsedUnion<T> {
    const result = v.safeParse(this.asn1Schema, data);
    if (!result.success) throw new SchemaMismatchError();
    const id = result.output.id;
    for (const field of this.fields) {
      try {
        return {
          name: field.name,
          tagClass: id.tagClass,
          tagType: id.tagType,
          value: field.schema.decode(result.output),
        } as AllChoiceItemsParsedUnion<T>;
      } catch (e) {
        if (e instanceof SchemaMismatchError) continue;
        console.error(e);
      }
    }
    throw new SchemaMismatchError();
  }

  encode(obj: AllChoiceItemsInputUnion<T>): Uint8Array {
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
        console.error(e);
      }
    }
    throw new SchemaMismatchError();
  }
}

export const choice = <const T extends ChoiceItemAry>(config: {
  fields: UniqueCheckedChoiceItemAry<T>;
}) => new ChoiceSchema(config);
