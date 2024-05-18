import { TagClass, type UniversalClassTag } from "../const";
import type { Asn1Data } from "../types";

export const decodeAsn1 = (aryBuf: ArrayBuffer): Asn1Data => {
  return _decodeAsn1(new Uint8Array(aryBuf))[0];
};

const _decodeAsn1 = (uint8Ary: Uint8Array): Asn1Data[] => {
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
    const isLongLenOct = lenOcts & 128;
    const lenOctCount = isLongLenOct ? lenOcts & 127 : 1;
    const len = isLongLenOct
      ? Number.parseInt(
          Buffer.from(uint8Ary.slice(++i, i + lenOctCount)).toString("hex"),
          16,
        )
      : lenOcts & 127;
    i += lenOctCount - 1;
    // Value Octets
    const valueOcts = uint8Ary.slice(++i, i + len);
    if (valueOcts.length !== len) throw new RangeError();
    const value = isConstructed
      ? valueOcts.length === 0
        ? []
        : _decodeAsn1(valueOcts)
      : valueOcts;
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
