import { describe, expect, it } from "vitest";
import { SequenceSchema, sequence } from "../../src/schema/sequence";
import { LazySchema, lazy } from "../../src/schema/lazy";
import { OctetStringSchema, octetString } from "../../src/schema/octet-string";
import { decodeAsn1 } from "../../src";

describe("Lazy", () => {
  type TreeType = {
    path: string;
    next?: TreeType | undefined;
  };
  const Tree: SequenceSchema<
    [
      {
        name: "path";
        schema: OctetStringSchema;
      },
      {
        name: "next";
        schema: LazySchema<TreeType, TreeType>;
        optional: true;
      },
    ]
  > = sequence({
    fields: [
      {
        name: "path",
        schema: octetString(),
      },
      {
        name: "next",
        schema: lazy(() => Tree),
        optional: true,
      },
    ],
  });

  it("encode", () => {
    expect(
      Buffer.from(
        Tree.encode({
          path: "one",
          next: {
            path: "two",
            next: {
              path: "three",
            },
          },
        }),
      )
        .toString("hex")
        .toUpperCase(),
    ).toEqual("301504036F6E65300E040374776F300704057468726565");
  });

  it("decode", () => {
    expect(
      Tree.decode(
        decodeAsn1(
          Buffer.from("301504036F6E65300E040374776F300704057468726565", "hex"),
        ),
      ),
    ).toEqual({
      path: "one",
      next: {
        path: "two",
        next: {
          path: "three",
        },
      },
    });
  });
});
