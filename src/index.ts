import { TagClass, UniversalClassTag } from "./const";

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

export const decodeAsn1 = (aryBuf: ArrayBuffer): Asn1Data => {
  return _decodeAsn1(new Uint8Array(aryBuf))[0];
};

export const _decodeAsn1 = (uint8Ary: Uint8Array): Asn1Data[] => {
  if (uint8Ary.length < 2) throw new RangeError();
  const result: Asn1Data[] = [];
  for (let i = 0; i < uint8Ary.length; i++) {
    // Identifer Octets
    const idOcts = uint8Ary[i];
    const tagType = idOcts & 31;
    const isConstructed = (idOcts & 32) >> 5 === 1;
    const tagClass = (idOcts >> 6) as TagClass;
    // Length Octets
    const lenOcts = uint8Ary[++i];
    const len = lenOcts & 127; // FIXME: https://en.wikipedia.org/wiki/X.690#Length_octets
    // Value Octets
    const valueOcts = uint8Ary.slice(++i, i + len);
    if (valueOcts.length !== len) throw new RangeError();
    const value = isConstructed ? _decodeAsn1(valueOcts) : valueOcts;
    result.push({
      id:
        tagClass === TagClass.UNIVERSAL
          ? {
              tagType: tagType as UniversalClassTag,
              isConstructed,
              tagClass,
            }
          : {
              isConstructed,
              tagClass,
              tagType,
            },
      len,
      value,
    });
    i += len - 1;
  }
  return result;
};

// export const encodeAsn1 = (asn1Data: Asn1Data): ArrayBuffer => {
//
// }
