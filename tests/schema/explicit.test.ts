import { describe, expect, it } from "vitest";
import { TagClass, decodeAsn1, octetString } from "../../src";
import { explicit } from "../../src/schema/explicit";

describe("Explicit", () => {
  const schema = explicit({
    tagClass: TagClass.CONTEXT_SPECIFIC,
    tagType: 2,
    wrappedSchema: octetString(),
  });

  it("encode", () => {
    expect(
      Buffer.from(schema.encode("hello")).toString("hex").toUpperCase(),
    ).toEqual("A207040568656C6C6F");
  });

  it("decode", () => {
    expect(
      schema.decode(decodeAsn1(Buffer.from("A207040568656C6C6F", "hex"))),
    ).toEqual("hello");
  });
});
