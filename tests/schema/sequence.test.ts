import { describe, expect, it } from "vitest";
import { decodeAsn1 } from "../../src";
import { integer } from "../../src/schema/integer";
import { octetString } from "../../src/schema/octet-string";
import { sequence } from "../../src/schema/sequence";

describe("Sequence", () => {
  /**
   * TODO: optionalTuple (v.special) の単体テスト
   * - i[r], s[r] => OK
   * - i[o], s[o] => OK
   * - i[o], s[o, r] => NG (スキーマ残り)
   * - i[r, o], s[o, r] => NG (インプット残り)
   */
  // describe("optionalTuple (SpecialValidation)", () => {
  // })

  describe("default", () => {
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

    it("encode", () => {
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

    it("decode", () => {
      const result = schema.decode(
        decodeAsn1(Buffer.from("300a020132040568656c6c6f", "hex")),
      );

      expect(result).toEqual({
        id: 50,
        message: "hello",
      });
    });
  });
  describe("optional", () => {
    const schema = sequence({
      fields: [
        {
          name: "id",
          schema: integer(),
        },
        {
          name: "message",
          schema: octetString(),
          optional: true,
        },
      ] as const,
    });

    describe("Data contain optional fields", () => {
      it("encode", () => {
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

      it("decode", () => {
        const result = schema.decode(
          decodeAsn1(Buffer.from("300a020132040568656c6c6f", "hex")),
        );

        expect(result).toEqual({
          id: 50,
          message: "hello",
        });
      });
    });

    describe("Data does not contain optional fields", () => {
      it("encode", () => {
        expect(
          Buffer.from(
            schema.encode({
              id: 50,
            }),
          )
            .toString("hex")
            .toUpperCase(),
        ).toEqual("3003020132");
      });

      it("decode", () => {
        const result = schema.decode(
          decodeAsn1(Buffer.from("3003020132", "hex")),
        );

        expect(result).toEqual({
          id: 50,
        });
      });
    });
  });
});
