import { describe, expect, it } from "vitest";
import { decodeAsn1 } from "../../src";
import { enumerated } from "../../src/schema/enumerated";

describe("Enumerated", () => {
  const enums = {
    hello: 1,
    world: 2,
  } as const;

  const schema = enumerated({
    enums,
  });

  it("encode", () => {
    expect(Buffer.from(schema.encode(1)).toString("hex").toUpperCase()).toEqual(
      "0A0101",
    );
    expect(
      Buffer.from(schema.encode(enums.world)).toString("hex").toUpperCase(),
    ).toEqual("0A0102");
  });

  it("decode", () => {
    expect(schema.decode(decodeAsn1(Buffer.from("0A0101", "hex")))).toEqual(
      enums.hello,
    );
  });
});
