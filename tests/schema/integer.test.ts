import { describe, expect, it } from "vitest";
import { decodeAsn1 } from "../../src";
import { integer } from "../../src/schema/integer";

describe("Integer", () => {
  const schema = integer();

  it("encode", () => {
    expect(Buffer.from(schema.encode(5)).toString("hex").toUpperCase()).toEqual(
      "020105",
    );
    expect(
      Buffer.from(schema.encode(3000)).toString("hex").toUpperCase(),
    ).toEqual("02020BB8");
  });

  it("decode", () => {
    expect(schema.decode(decodeAsn1(Buffer.from("020105", "hex")))).toEqual(5);
    expect(schema.decode(decodeAsn1(Buffer.from("02020BB8", "hex")))).toEqual(
      3000,
    );
  });
});
