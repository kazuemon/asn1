import { describe, expect, it } from "vitest";
import { decodeAsn1, Asn1Data } from "../src";
import { TagClass, UniversalClassTag } from "../src/const";

describe("Asn1 Decode Example", () => {
  describe("LDAP", () => {
    describe("BindResuest", () => {
      it("Anonymous", () => {
        const result = decodeAsn1(
          Buffer.from("300c020101600702010304008000", "hex"),
        );
        expect(result).toEqual({
          id: {
            tagClass: TagClass.UNIVERSAL,
            tagType: UniversalClassTag.SEQUENCE_AND_SEQUENCE_OF,
            isConstructed: true,
          },
          len: 12,
          value: [
            {
              id: {
                tagClass: TagClass.UNIVERSAL,
                tagType: UniversalClassTag.INTEGER,
                isConstructed: false,
              },
              len: 1,
              value: new Uint8Array([1]),
            },
            {
              id: {
                tagClass: TagClass.APPLICATION,
                tagType: 0,
                isConstructed: true,
              },
              len: 7,
              value: [
                {
                  id: {
                    tagClass: TagClass.UNIVERSAL,
                    tagType: UniversalClassTag.INTEGER,
                    isConstructed: false,
                  },
                  len: 1,
                  value: new Uint8Array([3]),
                },
                {
                  id: {
                    tagClass: TagClass.UNIVERSAL,
                    tagType: UniversalClassTag.OCTET_STRING,
                    isConstructed: false,
                  },
                  len: 0,
                  value: new Uint8Array([]),
                },
                {
                  id: {
                    tagClass: TagClass.CONTEXT_SPECIFIC,
                    tagType: 0,
                    isConstructed: false,
                  },
                  len: 0,
                  value: new Uint8Array([]),
                },
              ],
            },
          ],
        } as Asn1Data);
      });
      it("cn=admin (auth: 'password')", () => {
        const result = decodeAsn1(
          Buffer.from(
            "301c02010160170201030408636e3d61646d696e800870617373776f7264",
            "hex",
          ),
        );
        expect(result).toEqual({
          id: {
            tagClass: TagClass.UNIVERSAL,
            tagType: UniversalClassTag.SEQUENCE_AND_SEQUENCE_OF,
            isConstructed: true,
          },
          len: 28,
          value: [
            {
              id: {
                tagClass: TagClass.UNIVERSAL,
                tagType: UniversalClassTag.INTEGER,
                isConstructed: false,
              },
              len: 1,
              value: new Uint8Array([1]),
            },
            {
              id: {
                tagClass: TagClass.APPLICATION,
                tagType: 0,
                isConstructed: true,
              },
              len: 23,
              value: [
                {
                  id: {
                    tagClass: TagClass.UNIVERSAL,
                    tagType: UniversalClassTag.INTEGER,
                    isConstructed: false,
                  },
                  len: 1,
                  value: new Uint8Array([3]),
                },
                {
                  id: {
                    tagClass: TagClass.UNIVERSAL,
                    tagType: UniversalClassTag.OCTET_STRING,
                    isConstructed: false,
                  },
                  len: 8,
                  value: new Uint8Array(Buffer.from("cn=admin", "ascii")),
                },
                {
                  id: {
                    tagClass: TagClass.CONTEXT_SPECIFIC,
                    tagType: 0,
                    isConstructed: false,
                  },
                  len: 8,
                  value: new Uint8Array(Buffer.from("password", "ascii")),
                },
              ],
            },
          ],
        } as Asn1Data);
      });
    });
  });
});

// TODO: 異常系のテストの追加
