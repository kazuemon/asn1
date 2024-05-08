import { describe, expect, it } from "vitest";
import { sequenceOf } from "../../src/schema/sequence-of";
import { integer } from "../../src/schema/integer";
import { decodeAsn1 } from "../../src";

describe("SequenceOf", () => {
  const schema = sequenceOf({
    fieldSchema: integer(),
  });

  it("encode", () => {
    expect(
      Buffer.from(schema.encode([1, 2, 3]))
        .toString("hex")
        .toUpperCase(),
    ).toEqual("3009020101020102020103");
  });

  it("decode", () => {
    expect(
      schema.decode(decodeAsn1(Buffer.from("3009020101020102020103", "hex"))),
    ).toEqual([1, 2, 3]);
  });
});
