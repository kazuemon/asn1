import type { TagClass, UniversalClassTag } from "../const";

export type Asn1Data = {
  id:
    | {
        tagType: number;
        tagClass:
          | typeof TagClass.APPLICATION
          | typeof TagClass.CONTEXT_SPECIFIC
          | typeof TagClass.PRIVATE;
        isConstructed: boolean;
      }
    | {
        tagClass: typeof TagClass.UNIVERSAL;
        tagType: UniversalClassTag;
        isConstructed: boolean;
      };
  len: number;
  value: Asn1Data[] | Uint8Array;
};
