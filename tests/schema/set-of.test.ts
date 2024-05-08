import { describe, expect, it } from "vitest";
import { setOf } from "../../src/schema/set-of";
import { integer } from "../../src/schema/integer";
import { decodeAsn1 } from "../../src";

describe("SetOf", () => {
  const schema = setOf({
    fieldSchema: integer(),
  });

  it("encode", () => {
    expect(
      Buffer.from(schema.encode([1, 2, 3]))
        .toString("hex")
        .toUpperCase(),
    ).toEqual("3109020101020102020103");
  });

  it("decode", () => {
    expect(
      schema.decode(decodeAsn1(Buffer.from("3109020101020102020103", "hex"))),
    ).toEqual([1, 2, 3]);
  });
});
