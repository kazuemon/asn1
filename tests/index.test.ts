import { describe, expect, it } from "vitest";
import { decodeAsn1, Asn1Data } from "../src";
import { TagClass, UniversalClassTag } from "../src/const";
import { integer } from "../src/schema/integer";
import { octetString } from "../src/schema/octet-string";
import { sequence } from "../src/schema/sequence";

describe("ASN1 を正しくパースできる", () => {
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

// TODO: 異常系のテストの追加

describe("スキーマを用いて正しくエンコード/デコードできる", () => {
  describe("Integer", () => {
    const schema = integer();

    it("エンコード", () => {
      expect(
        Buffer.from(schema.encode(5)).toString("hex").toUpperCase(),
      ).toEqual("020105");
      expect(
        Buffer.from(schema.encode(3000)).toString("hex").toUpperCase(),
      ).toEqual("02020BB8");
    });

    it("デコード", () => {
      expect(schema.decode(decodeAsn1(Buffer.from("020105", "hex")))).toEqual(
        5,
      );
      expect(schema.decode(decodeAsn1(Buffer.from("02020BB8", "hex")))).toEqual(
        3000,
      );
    });
  });

  describe("OctetString", () => {
    const schema = octetString();

    it("エンコード", () => {
      expect(
        Buffer.from(schema.encode("Hello, world!"))
          .toString("hex")
          .toUpperCase(),
      ).toEqual("040D48656C6C6F2C20776F726C6421");
      expect(
        Buffer.from(schema.encode("cn=admin")).toString("hex").toUpperCase(),
      ).toEqual("0408636E3D61646D696E");
    });

    it("デコード", () => {
      expect(
        schema.decode(
          decodeAsn1(Buffer.from("040D48656C6C6F2C20776F726C6421", "hex")),
        ),
      ).toEqual("Hello, world!");
      expect(
        schema.decode(decodeAsn1(Buffer.from("0408636E3D61646D696E", "hex"))),
      ).toEqual("cn=admin");
    });
  });

  describe("Sequence", () => {
    const schema = sequence({
      fields: [
        {
          name: "id",
          schema: integer(),
        },
        {
          name: "message",
          schema: octetString(),
        },
      ] as const,
    });

    it("エンコード", () => {
      expect(
        Buffer.from(
          schema.encode({
            id: 50,
            message: "hello",
          }),
        )
          .toString("hex")
          .toUpperCase(),
      ).toEqual("300A020132040568656C6C6F");
    });

    it("デコード", () => {
      const result = schema.decode(
        decodeAsn1(Buffer.from("300a020132040568656c6c6f", "hex")),
      );

      expect(result).toEqual({
        id: 50,
        message: "hello",
      });
    });
  });
});
