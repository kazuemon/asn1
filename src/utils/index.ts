export const pad0Hex = (hex: string) => (hex.length & 1 ? `0${hex}` : hex);
