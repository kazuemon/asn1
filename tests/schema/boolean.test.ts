import { describe, expect, it } from "vitest";
import { decodeAsn1 } from "../../src";
import { boolean } from "../../src/schema/boolean";

describe("Boolean", () => {
  const schema = boolean();

  it("encode", () => {
    expect(
      Buffer.from(schema.encode(true)).toString("hex").toUpperCase(),
    ).toEqual("010101");
    expect(
      Buffer.from(schema.encode(false)).toString("hex").toUpperCase(),
    ).toEqual("010100");
  });

  it("decode", () => {
    expect(schema.decode(decodeAsn1(Buffer.from("010101", "hex")))).toEqual(
      true,
    );
    expect(schema.decode(decodeAsn1(Buffer.from("010100", "hex")))).toEqual(
      false,
    );
  });
});
