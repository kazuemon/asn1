import { describe, expect, it } from "vitest";
import { decodeAsn1 } from "../../src";
import { integer } from "../../src/schema/integer";
import { octetString } from "../../src/schema/octet-string";
import { sequence } from "../../src/schema/sequence";

describe("Sequence", () => {
  const schema = sequence({
    fields: [
      {
        name: "id",
        schema: integer(),
      },
      {
        name: "message",
        schema: octetString(),
      },
    ] as const,
  });

  it("encode", () => {
    expect(
      Buffer.from(
        schema.encode({
          id: 50,
          message: "hello",
        }),
      )
        .toString("hex")
        .toUpperCase(),
    ).toEqual("300A020132040568656C6C6F");
  });

  it("decode", () => {
    const result = schema.decode(
      decodeAsn1(Buffer.from("300a020132040568656c6c6f", "hex")),
    );

    expect(result).toEqual({
      id: 50,
      message: "hello",
    });
  });
});
