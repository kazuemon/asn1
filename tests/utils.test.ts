import { describe, expect, it } from "vitest";
import { getLengthOctetAry } from "../src/utils";

describe("Utils", () => {
  describe("getLengthOctetAry", () => {
    it("invalid pattern", () => {
      expect(() => getLengthOctetAry(0.1)).toThrowError(TypeError);
      expect(() => getLengthOctetAry(-1)).toThrowError(RangeError);
    });
    it("0 <= n < 128 (short, 1bit)", () => {
      expect(getLengthOctetAry(0)).toEqual([0]);
      expect(getLengthOctetAry(127)).toEqual([127]);
    });
    it("128 <= n < 256 (long, 2bit)", () => {
      expect(getLengthOctetAry(128)).toEqual([129, 128]);
      expect(getLengthOctetAry(255)).toEqual([129, 255]);
    });
    it("255 < n (long, 3bit)", () => {
      expect(getLengthOctetAry(256)).toEqual([130, 1, 0]);
    });
  });
});
