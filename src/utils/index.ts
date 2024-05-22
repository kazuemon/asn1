export const pad0Hex = (hex: string) => (hex.length & 1 ? `0${hex}` : hex);

export const getLengthOctetAry = (length: number) => {
  if (!Number.isInteger(length)) throw new TypeError();
  if (length < 0) throw new RangeError();
  if (length < 128) return [length];
  let _len = length;
  const needBit = Math.floor(Math.log2(length)) + 1;
  if (needBit > 127) throw new RangeError(); // ¯\_(ツ)_/¯
  const followingOctetLength = Math.ceil(needBit / 8);
  const followingOctetAry: number[] = [];
  for (let i = 0; i < followingOctetLength; i++) {
    followingOctetAry.unshift(_len & 255);
    _len >>>= 8;
  }
  return [128 + followingOctetLength, ...followingOctetAry];
};
