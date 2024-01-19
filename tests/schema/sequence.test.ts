import { describe, expect, it } from "vitest";
import { decodeAsn1 } from "../../src";
import { integer } from "../../src/schema/integer";
import { octetString } from "../../src/schema/octet-string";
import { sequence } from "../../src/schema/sequence";
import { TagClass } from "../../src/const";

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
      ],
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
  describe("empty", () => {
    const schema = sequence({
      fields: [
        {
          name: "id",
          schema: integer(),
          optional: true,
        },
        {
          name: "message",
          schema: octetString(),
          optional: true,
        },
      ],
    });
    it("encode", () => {
      expect(
        Buffer.from(schema.encode({})).toString("hex").toUpperCase(),
      ).toEqual("3000");
    });

    it("decode", () => {
      const result = schema.decode(decodeAsn1(Buffer.from("3000", "hex")));

      expect(result).toEqual({});
    });
  });
  describe("optional", () => {
    describe("[required, optional]", () => {
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
        ],
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
    describe("[optional, required]", () => {
      const schema = sequence({
        fields: [
          {
            name: "id",
            schema: integer(),
            optional: true,
          },
          {
            name: "message",
            schema: octetString(),
          },
        ],
      });

      describe("Data contain optional fields", () => {
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
                message: "hello",
              }),
            )
              .toString("hex")
              .toUpperCase(),
          ).toEqual("3007040568656C6C6F");
        });

        it("decode", () => {
          const result = schema.decode(
            decodeAsn1(Buffer.from("3007040568656c6c6f", "hex")),
          );

          expect(result).toEqual({
            message: "hello",
          });
        });
      });
    });
  });
  describe("Context-Specific", () => {
    // from https://letsencrypt.org/ja/docs/a-warm-welcome-to-asn1-and-der
    const schema = sequence({
      fields: [
        {
          name: "x",
          schema: integer({
            tagClass: TagClass.CONTEXT_SPECIFIC,
            tagType: 0,
          }),
          optional: true,
        },
        {
          name: "y",
          schema: integer({
            tagClass: TagClass.CONTEXT_SPECIFIC,
            tagType: 1,
          }),
          optional: true,
        },
      ],
    });
    describe("none", () => {
      it("encode", () => {
        expect(
          Buffer.from(schema.encode({})).toString("hex").toUpperCase(),
        ).toEqual("3000");
      });

      it("decode", () => {
        const result = schema.decode(decodeAsn1(Buffer.from("3000", "hex")));

        expect(result).toEqual({});
      });
    });
    describe("only x", () => {
      it("encode", () => {
        expect(
          Buffer.from(
            schema.encode({
              x: 9,
            }),
          )
            .toString("hex")
            .toUpperCase(),
        ).toEqual("3003800109");
      });

      it("decode", () => {
        const result = schema.decode(
          decodeAsn1(Buffer.from("3003800109", "hex")),
        );

        expect(result).toEqual({
          x: 9,
        });
      });
    });
    describe("only y", () => {
      it("encode", () => {
        expect(
          Buffer.from(
            schema.encode({
              y: 10,
            }),
          )
            .toString("hex")
            .toUpperCase(),
        ).toEqual("300381010A");
      });

      it("decode", () => {
        const result = schema.decode(
          decodeAsn1(Buffer.from("300381010A", "hex")),
        );

        expect(result).toEqual({
          y: 10,
        });
      });
    });
    describe("x and y", () => {
      it("encode", () => {
        expect(
          Buffer.from(
            schema.encode({
              x: 9,
              y: 10,
            }),
          )
            .toString("hex")
            .toUpperCase(),
        ).toEqual("300680010981010A");
      });

      it("decode", () => {
        const result = schema.decode(
          decodeAsn1(Buffer.from("300680010981010A", "hex")),
        );

        expect(result).toEqual({
          x: 9,
          y: 10,
        });
      });
    });
    describe("y and x", () => {
      it("decode", () => {
        const result = schema.decode(
          decodeAsn1(Buffer.from("300681010A800109", "hex")),
        );

        expect(result).toEqual({
          x: 9,
          y: 10,
        });
      });
    });
  });
});
