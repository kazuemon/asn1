import { Asn1Data } from "..";
import { TagClass, UniversalClassTag } from "../const";

/**
 * Util
 */

// Thanks https://stackoverflow.com/questions/56988970/tuple-to-object-in-typescript-via-generics
type TupleToObject<T extends Readonly<[string, any]>> = {
  [K in T[0]]: Extract<T, [K, any]>[1];
};

type PartialByKeys<T, Keys extends keyof T> = Omit<T, Keys> &
  Partial<Pick<T, Keys>>;

/**
 * Base
 */

interface Base<ToType, FromType> {
  encode(obj: FromType): Uint8Array;
  decode(data: Asn1Data): ToType;
}

/**
 * Settled
 */

interface Settled<TSType, TClass extends TagClass, TType extends number>
  extends Base<TSType, TSType> {
  tagClass: TClass;
  tagType: TType;
}

/**
 * Num
 */

interface Num<TClass extends TagClass, TType extends number>
  extends Settled<number, TClass, TType> {}

type num<
  TClass extends TagClass = typeof TagClass.UNIVERSAL,
  TType extends number = typeof UniversalClassTag.INTEGER,
> = (config: {
  tagClass?: TClass;
  tagType?: TType;
}) => Num<TClass, TType>;

/**
 * Text
 */

interface Text<TClass extends TagClass, TType extends number>
  extends Settled<string, TClass, TType> {}

type text<
  TClass extends TagClass = typeof TagClass.UNIVERSAL,
  TType extends number = typeof UniversalClassTag.OCTET_STRING,
> = (config: {
  tagClass?: TClass;
  tagType?: TType;
}) => Text<TClass, TType>;

/**
 * List
 */

type ListItem<Name extends string, Schema extends Base<any, any>> = {
  name: Name;
  schema: Schema;
  optional?: boolean;
};

type AnyListItem = ListItem<string, any>;

type ListItemAry = Readonly<[AnyListItem, ...AnyListItem[]]>;

type ListAllItemsTuple<T extends ListItemAry> = {
  [P in keyof T]: [T[P]["name"], ReturnType<T[P]["schema"]["decode"]>];
};

type ListOptionalItemsNameTuple<T extends ListItemAry> = Extract<
  T[number],
  { optional: true }
>["name"];

type ListAllItemsObjectType<T extends ListItemAry> = TupleToObject<
  ListAllItemsTuple<T>[number]
>;

type ListItemsReturnType<T extends ListItemAry> = PartialByKeys<
  ListAllItemsObjectType<T>,
  ListOptionalItemsNameTuple<T>
>;

interface List<
  Items extends ListItemAry,
  TClass extends TagClass,
  TType extends number,
> extends Settled<ListItemsReturnType<Items>, TClass, TType> {}

type ListAllItemsIdentifierTuple<T extends ListItemAry> = {
  -readonly [P in keyof T]: T[P]["schema"] extends Settled<
    infer _TSType,
    infer TClass,
    infer TType
  >
    ? [TClass, TType]
    : never;
};

type list<
  Items extends ListItemAry,
  TClass extends TagClass = typeof TagClass.UNIVERSAL,
  TType extends number = typeof UniversalClassTag.SEQUENCE_AND_SEQUENCE_OF,
> = (config: {
  fields: Items;
  tagClass: TClass;
  tagType: TType;
}) => List<Items, TClass, TType>;

{
  // OK
  type validItems = Readonly<
    [
      {
        name: "mustNum";
        schema: ReturnType<num>;
      },
      {
        name: "optStr";
        schema: ReturnType<text>;
        optional: true;
      },
    ]
  >;

  type listCls = ReturnType<list<validItems>>;

  type test1 = ReturnType<listCls["decode"]>["mustNum"]; // number
  type test2 = ReturnType<listCls["decode"]>["optStr"]; // string | undefined

  type test3 =
    ListAllItemsIdentifierTuple<validItems>["length"] extends ListAllItemsIdentifierTuple<validItems>[number]["length"]
      ? "OK"
      : "NG"; // OK
}

{
  // TODO: This should be ERROR
  type invalidItems = Readonly<
    [
      {
        name: "mustNum1";
        schema: ReturnType<num>;
      },
      {
        name: "mustNum2";
        schema: ReturnType<num>;
      },
      {
        name: "mustNum3";
        schema: ReturnType<text>;
      },
    ]
  >;

  type listCls = ReturnType<list<invalidItems>>;

  type test1 = ListAllItemsIdentifierTuple<invalidItems>;
  type test2 = test1["length"];
  type test3 = test1[number];
}

/**
 * Choice
 */

type ChoiceItem<Name extends string, Schema extends Base<any, any>> = {
  name: Name;
  schema: Schema;
};

type AnyChoiceItem = ChoiceItem<string, any>;

type ChoiceItemAry = Readonly<[AnyChoiceItem, ...AnyChoiceItem[]]>;

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

export type BERParsedData<
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

type AllChoiceItemsParsedUnion<T extends ChoiceItemAry> = {
  [P in keyof T]: T[P]["schema"] extends Settled<
    infer TSType,
    infer TClass,
    infer TType
  >
    ? BERParsedData<TSType, T[P]["name"], TClass, TType>
    : never;
};

type AllChoiceItemsInputUnion<T extends ChoiceItemAry> = {
  [P in keyof T]: T[P]["schema"] extends Settled<
    infer TSType,
    infer TClass,
    infer TType
  >
    ?
        | BERInputDataByName<TSType, T[P]["name"]>
        | BERInputDataByIdentifier<TSType, TClass, TType>
    : never;
};

interface Unsettled<ToType, FromType> extends Base<ToType, FromType> {}

interface Choice<Items extends ChoiceItemAry>
  extends Unsettled<
    AllChoiceItemsParsedUnion<Items>[number],
    AllChoiceItemsInputUnion<Items>[number]
  > {}

type choice<Items extends ChoiceItemAry> = (config: {
  items: Items;
}) => Choice<Items>;

{
  // OK
  type validItems = Readonly<
    [
      {
        name: "price";
        schema: ReturnType<num<typeof TagClass.APPLICATION, 0>>;
      },
      {
        name: "amount";
        schema: ReturnType<num<typeof TagClass.APPLICATION, 1>>;
      },
      {
        name: "left";
        schema: ReturnType<num<typeof TagClass.APPLICATION, 2>>;
      },
    ]
  >;

  type choiceCls = ReturnType<choice<validItems>>;
  type test1 = ReturnType<choiceCls["decode"]>;
  type test2 = choiceCls["encode"];
}

{
  // TODO: This should be ERROR
  type invalidItems = Readonly<
    [
      {
        name: "price";
        schema: ReturnType<num<typeof TagClass.APPLICATION, 0>>;
      },
      {
        name: "amount";
        schema: ReturnType<num<typeof TagClass.APPLICATION, 0>>;
      },
      {
        name: "left";
        schema: ReturnType<num<typeof TagClass.APPLICATION, 2>>;
      },
    ]
  >;
}

{
  // TODO: This should be ERROR
  type invalidItems = Readonly<
    [
      {
        name: "price";
        schema: ReturnType<num<typeof TagClass.APPLICATION, 0>>;
      },
      {
        name: "price";
        schema: ReturnType<num<typeof TagClass.APPLICATION, 1>>;
      },
      {
        name: "left";
        schema: ReturnType<num<typeof TagClass.APPLICATION, 2>>;
      },
    ]
  >;
}
