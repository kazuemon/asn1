import { integer } from "../../src/schema/integer";
import { choice } from "../../src/schema/choice";
import { octetString } from "../../src/schema/octet-string";
import { describe, expect, it } from "vitest";
import { decodeAsn1 } from "../../src";
import { TagClass } from "../../src/const";

describe("choice", () => {
  describe("single", () => {
    const schema = choice({
      fields: [
        {
          name: "a",
          schema: integer(),
        },
      ],
    });
    it("encode", () => {
      expect(
        Buffer.from(
          schema.encode({
            name: "a",
            value: 5,
          }),
        )
          .toString("hex")
          .toUpperCase(),
      ).toEqual("020105");
    });
    it("encode", () => {
      expect(schema.decode(decodeAsn1(Buffer.from("020105", "hex")))).toEqual({
        name: "a",
        tagClass: 0,
        tagType: 2,
        value: 5,
      });
    });
  });
  describe("multiple", () => {
    describe("different type and different tag", () => {
      const schema = choice({
        fields: [
          {
            name: "a",
            schema: integer(),
          },
          {
            name: "b",
            schema: octetString(),
          },
        ],
      });
      it("encode", () => {
        expect(
          Buffer.from(
            schema.encode({
              name: "a",
              value: 5,
            }),
          )
            .toString("hex")
            .toUpperCase(),
        ).toEqual("020105");
        expect(
          Buffer.from(
            schema.encode({
              name: "b",
              value: "hello",
            }),
          )
            .toString("hex")
            .toUpperCase(),
        ).toEqual("040568656C6C6F");
      });
      it("decode", () => {
        expect(schema.decode(decodeAsn1(Buffer.from("020105", "hex")))).toEqual(
          {
            name: "a",
            tagClass: 0,
            tagType: 2,
            value: 5,
          },
        );
        expect(
          schema.decode(decodeAsn1(Buffer.from("040568656C6C6F", "hex"))),
        ).toEqual({
          name: "b",
          tagClass: 0,
          tagType: 4,
          value: "hello",
        });
      });
    });
    describe("same type and different tag", () => {
      const schema = choice({
        fields: [
          {
            name: "a",
            schema: integer({
              tagClass: TagClass.APPLICATION,
              tagType: 0,
            }),
          },
          {
            name: "b",
            schema: integer({
              tagClass: TagClass.APPLICATION,
              tagType: 1,
            }),
          },
        ],
      });
      it("encode", () => {
        expect(
          Buffer.from(
            schema.encode({
              name: "a",
              value: 5,
            }),
          )
            .toString("hex")
            .toUpperCase(),
        ).toEqual("400105");
        expect(
          Buffer.from(
            schema.encode({
              name: "b",
              value: 5,
            }),
          )
            .toString("hex")
            .toUpperCase(),
        ).toEqual("410105");
      });
      it("decode", () => {
        expect(schema.decode(decodeAsn1(Buffer.from("400105", "hex")))).toEqual(
          {
            name: "a",
            tagClass: 1,
            tagType: 0,
            value: 5,
          },
        );
        expect(schema.decode(decodeAsn1(Buffer.from("410106", "hex")))).toEqual(
          {
            name: "b",
            tagClass: 1,
            tagType: 1,
            value: 6,
          },
        );
      });
    });
  });
  describe("choice in choice", () => {
    const schema = choice({
      fields: [
        {
          name: "a",
          schema: integer(),
        },
        {
          name: "b",
          schema: choice({
            fields: [
              {
                name: "b1",
                schema: integer({
                  tagClass: TagClass.APPLICATION,
                  tagType: 0,
                }),
              },
              {
                name: "b2",
                schema: integer({
                  tagClass: TagClass.APPLICATION,
                  tagType: 1,
                }),
              },
            ],
          }),
        },
      ],
    });
    it("encode", () => {
      // expect(
      //   Buffer.from(
      //     schema.encode({
      //       name: "a",
      //       value: 5,
      //     }),
      //   )
      //     .toString("hex")
      //     .toUpperCase(),
      // ).toEqual("020105");
      expect(
        Buffer.from(
          schema.encode({
            name: "b",
            value: {
              name: "b1",
              value: 5,
            },
          }),
        )
          .toString("hex")
          .toUpperCase(),
      ).toEqual("400105");
    });
    it("decode", () => {
      expect(schema.decode(decodeAsn1(Buffer.from("400105", "hex")))).toEqual({
        name: "b",
        tagClass: 1,
        tagType: 0,
        value: {
          name: "b1",
          tagClass: 1,
          tagType: 0,
          value: 5,
        },
      });
    });
  });
});
