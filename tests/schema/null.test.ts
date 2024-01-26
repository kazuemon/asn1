import { describe, expect, it } from "vitest";
import { decodeAsn1 } from "../../src";
import { null_ } from "../../src/schema/null";
import { ValiError } from "valibot";

describe("Null", () => {
  const schema = null_();

  it("encode", () => {
    expect(
      Buffer.from(schema.encode(null)).toString("hex").toUpperCase(),
    ).toEqual("0500");
  });

  it("decode", () => {
    expect(schema.decode(decodeAsn1(Buffer.from("0500", "hex")))).toEqual(null);

    expect(() =>
      schema.decode(decodeAsn1(Buffer.from("050101", "hex"))),
    ).toThrowError(ValiError);
  });
});
