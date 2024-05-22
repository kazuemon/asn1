import { describe, expect, it } from "vitest";
import { decodeAsn1, type Asn1Data, sequence, octetString } from "../src";
import { TagClass, UniversalClassTag } from "../src/const";

describe("Asn1 Decode Example", () => {
  describe("long length octet", () => {
    it("decode (6+293)", () => {
      const result = decodeAsn1(
        Buffer.from(
          "30840000012502010263840000011c04000a01000a0100020100020100010100870b6f626a656374436c6173733084000000f804012a0411737562736368656d61537562656e747279040e6e616d696e67436f6e74657874730412737570706f72746564457874656e73696f6e0411737570706f7274656446656174757265730410737570706f72746564436f6e74726f6c0417737570706f727465645341534c4d656368616e69736d730414737570706f727465644c44415056657273696f6e0409616c74536572766572041464656661756c744e616d696e67436f6e746578740417726f6f74446f6d61696e4e616d696e67436f6e74657874040a76656e646f724e616d65040d76656e646f7256657273696f6e041369626d6469726563746f727976657273696f6e",
          "hex",
        ),
      );
      expect(result).toEqual({
        id: {
          tagClass: TagClass.UNIVERSAL,
          tagType: UniversalClassTag.SEQUENCE_AND_SEQUENCE_OF,
          isConstructed: true,
        },
        len: 293,
        value: [
          {
            id: {
              tagClass: TagClass.UNIVERSAL,
              tagType: UniversalClassTag.INTEGER,
              isConstructed: false,
            },
            len: 1,
            value: new Uint8Array([2]),
          },
          {
            id: {
              tagClass: TagClass.APPLICATION,
              tagType: 3,
              isConstructed: true,
            },
            len: 284,
            value: [
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
                  tagClass: TagClass.UNIVERSAL,
                  tagType: UniversalClassTag.ENUMERATED,
                  isConstructed: false,
                },
                len: 1,
                value: new Uint8Array([0]),
              },
              {
                id: {
                  tagClass: TagClass.UNIVERSAL,
                  tagType: UniversalClassTag.ENUMERATED,
                  isConstructed: false,
                },
                len: 1,
                value: new Uint8Array([0]),
              },
              {
                id: {
                  tagClass: TagClass.UNIVERSAL,
                  tagType: UniversalClassTag.INTEGER,
                  isConstructed: false,
                },
                len: 1,
                value: new Uint8Array([0]),
              },
              {
                id: {
                  tagClass: TagClass.UNIVERSAL,
                  tagType: UniversalClassTag.INTEGER,
                  isConstructed: false,
                },
                len: 1,
                value: new Uint8Array([0]),
              },
              {
                id: {
                  tagClass: TagClass.UNIVERSAL,
                  tagType: UniversalClassTag.BOOLEAN,
                  isConstructed: false,
                },
                len: 1,
                value: new Uint8Array([0]),
              },
              {
                id: {
                  tagClass: TagClass.CONTEXT_SPECIFIC,
                  tagType: 7,
                  isConstructed: false,
                },
                len: 11,
                value: new Uint8Array([
                  111, 98, 106, 101, 99, 116, 67, 108, 97, 115, 115,
                ]),
              },
              {
                id: {
                  tagClass: TagClass.UNIVERSAL,
                  tagType: UniversalClassTag.SEQUENCE_AND_SEQUENCE_OF,
                  isConstructed: true,
                },
                len: 248,
                value: [
                  {
                    id: {
                      tagClass: TagClass.UNIVERSAL,
                      tagType: UniversalClassTag.OCTET_STRING,
                      isConstructed: false,
                    },
                    len: 1,
                    value: new Uint8Array([42]),
                  },
                  {
                    id: {
                      tagClass: TagClass.UNIVERSAL,
                      tagType: UniversalClassTag.OCTET_STRING,
                      isConstructed: false,
                    },
                    len: 17,
                    value: new Uint8Array([
                      115, 117, 98, 115, 99, 104, 101, 109, 97, 83, 117, 98,
                      101, 110, 116, 114, 121,
                    ]),
                  },
                  {
                    id: {
                      tagClass: TagClass.UNIVERSAL,
                      tagType: UniversalClassTag.OCTET_STRING,
                      isConstructed: false,
                    },
                    len: 14,
                    value: new Uint8Array([
                      110, 97, 109, 105, 110, 103, 67, 111, 110, 116, 101, 120,
                      116, 115,
                    ]),
                  },
                  {
                    id: {
                      tagClass: TagClass.UNIVERSAL,
                      tagType: UniversalClassTag.OCTET_STRING,
                      isConstructed: false,
                    },
                    len: 18,
                    value: new Uint8Array([
                      115, 117, 112, 112, 111, 114, 116, 101, 100, 69, 120, 116,
                      101, 110, 115, 105, 111, 110,
                    ]),
                  },
                  {
                    id: {
                      tagClass: TagClass.UNIVERSAL,
                      tagType: UniversalClassTag.OCTET_STRING,
                      isConstructed: false,
                    },
                    len: 17,
                    value: new Uint8Array([
                      115, 117, 112, 112, 111, 114, 116, 101, 100, 70, 101, 97,
                      116, 117, 114, 101, 115,
                    ]),
                  },
                  {
                    id: {
                      tagClass: TagClass.UNIVERSAL,
                      tagType: UniversalClassTag.OCTET_STRING,
                      isConstructed: false,
                    },
                    len: 16,
                    value: new Uint8Array([
                      115, 117, 112, 112, 111, 114, 116, 101, 100, 67, 111, 110,
                      116, 114, 111, 108,
                    ]),
                  },
                  {
                    id: {
                      tagClass: TagClass.UNIVERSAL,
                      tagType: UniversalClassTag.OCTET_STRING,
                      isConstructed: false,
                    },
                    len: 23,
                    value: new Uint8Array([
                      115, 117, 112, 112, 111, 114, 116, 101, 100, 83, 65, 83,
                      76, 77, 101, 99, 104, 97, 110, 105, 115, 109, 115,
                    ]),
                  },
                  {
                    id: {
                      tagClass: TagClass.UNIVERSAL,
                      tagType: UniversalClassTag.OCTET_STRING,
                      isConstructed: false,
                    },
                    len: 20,
                    value: new Uint8Array([
                      115, 117, 112, 112, 111, 114, 116, 101, 100, 76, 68, 65,
                      80, 86, 101, 114, 115, 105, 111, 110,
                    ]),
                  },
                  {
                    id: {
                      tagClass: TagClass.UNIVERSAL,
                      tagType: UniversalClassTag.OCTET_STRING,
                      isConstructed: false,
                    },
                    len: 9,
                    value: new Uint8Array([
                      97, 108, 116, 83, 101, 114, 118, 101, 114,
                    ]),
                  },
                  {
                    id: {
                      tagClass: TagClass.UNIVERSAL,
                      tagType: UniversalClassTag.OCTET_STRING,
                      isConstructed: false,
                    },
                    len: 20,
                    value: new Uint8Array([
                      100, 101, 102, 97, 117, 108, 116, 78, 97, 109, 105, 110,
                      103, 67, 111, 110, 116, 101, 120, 116,
                    ]),
                  },
                  {
                    id: {
                      tagClass: TagClass.UNIVERSAL,
                      tagType: UniversalClassTag.OCTET_STRING,
                      isConstructed: false,
                    },
                    len: 23,
                    value: new Uint8Array([
                      114, 111, 111, 116, 68, 111, 109, 97, 105, 110, 78, 97,
                      109, 105, 110, 103, 67, 111, 110, 116, 101, 120, 116,
                    ]),
                  },
                  {
                    id: {
                      tagClass: TagClass.UNIVERSAL,
                      tagType: UniversalClassTag.OCTET_STRING,
                      isConstructed: false,
                    },
                    len: 10,
                    value: new Uint8Array([
                      118, 101, 110, 100, 111, 114, 78, 97, 109, 101,
                    ]),
                  },
                  {
                    id: {
                      tagClass: TagClass.UNIVERSAL,
                      tagType: UniversalClassTag.OCTET_STRING,
                      isConstructed: false,
                    },
                    len: 13,
                    value: new Uint8Array([
                      118, 101, 110, 100, 111, 114, 86, 101, 114, 115, 105, 111,
                      110,
                    ]),
                  },
                  {
                    id: {
                      tagClass: TagClass.UNIVERSAL,
                      tagType: UniversalClassTag.OCTET_STRING,
                      isConstructed: false,
                    },
                    len: 19,
                    value: new Uint8Array([
                      105, 98, 109, 100, 105, 114, 101, 99, 116, 111, 114, 121,
                      118, 101, 114, 115, 105, 111, 110,
                    ]),
                  },
                ],
              },
            ],
          },
        ],
      });
    });
    it("encode (4+345)", () => {
      const schema = sequence({
        fields: [
          {
            name: "line1",
            schema: octetString(),
          },
          {
            name: "line2",
            schema: octetString(),
          },
          {
            name: "line3",
            schema: octetString(),
          },
          {
            name: "line4",
            schema: octetString(),
          },
        ],
      });

      const result = schema.encode({
        line1:
          "This is a test sentence, and as such, it holds no real value or meaning for readers.",
        line2:
          "The purpose here is purely functional, making this text unworthy of deeper attention.",
        line3:
          "No valuable information is contained here; it exists solely to serve as a placeholder.",
        line4:
          "Reading this is pointless, as it was created merely to test formatting and length.",
      });

      expect(Buffer.from(result).toString("hex").toUpperCase()).toEqual(
        "30820159045454686973206973206120746573742073656E74656E63652C20616E6420617320737563682C20697420686F6C6473206E6F207265616C2076616C7565206F72206D65616E696E6720666F7220726561646572732E045554686520707572706F7365206865726520697320707572656C792066756E6374696F6E616C2C206D616B696E672074686973207465787420756E776F72746879206F662064656570657220617474656E74696F6E2E04564E6F2076616C7561626C6520696E666F726D6174696F6E20697320636F6E7461696E656420686572653B2069742065786973747320736F6C656C7920746F207365727665206173206120706C616365686F6C6465722E045252656164696E67207468697320697320706F696E746C6573732C206173206974207761732063726561746564206D6572656C7920746F207465737420666F726D617474696E6720616E64206C656E6774682E",
      );
    });
  });

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
