import { describe, expect, it } from "vitest";
import { decodeAsn1 } from "../../src";
import { octetString } from "../../src/schema/octet-string";

describe("OctetString", () => {
  const schema = octetString();

  it("encode", () => {
    expect(
      Buffer.from(schema.encode("Hello, world!")).toString("hex").toUpperCase(),
    ).toEqual("040D48656C6C6F2C20776F726C6421");
    expect(
      Buffer.from(schema.encode("cn=admin")).toString("hex").toUpperCase(),
    ).toEqual("0408636E3D61646D696E");
  });

  it("decode", () => {
    expect(
      schema.decode(
        decodeAsn1(Buffer.from("040D48656C6C6F2C20776F726C6421", "hex")),
      ),
    ).toEqual("Hello, world!");
    expect(
      schema.decode(decodeAsn1(Buffer.from("0408636E3D61646D696E", "hex"))),
    ).toEqual("cn=admin");
  });
});
