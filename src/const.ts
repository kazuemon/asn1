export const UniversalClassTag = {
  EOC: 0,
  BOOLEAN: 1,
  INTEGER: 2,
  BIT_STRING: 3,
  OCTET_STRING: 4,
  NULL: 5,
  OBJECT_IDENTIFIER: 6,
  OBJECT_DESCRIPTOR: 7,
  EXTERNAL: 8,
  REAL: 9,
  ENUMERATED: 10,
  EMBEDDED_PDV: 11,
  UTF8_STRING: 12,
  RELATIVE_OID: 13,
  TIME: 14,
  // Reserved: 15
  SEQUENCE_AND_SEQUENCE_OF: 16,
  SET_AND_SET_OF: 17,
  NUMERIC_STRING: 18,
  PRINTABLE_STRING: 19,
  T61_STRING: 20,
  VIDEOTEX_STRING: 21,
  IA5_STRING: 22,
  UTC_TIME: 23,
  GENERALIZED_STRING: 24,
  GRAPHIC_STRING: 25,
  VISIBLE_STRING: 26,
  GENERAL_STRING: 27,
  UNIVERSAL_STRING: 28,
  CHARACTER_STRING: 29,
  BMP_STRING: 30,
  DATE: 31,
  TIME_OF_DAY: 32,
  DATE_TIME: 33,
  DURATION: 34,
  OID_IRI: 35,
  RELATIVE_OID_IRI: 36,
} as const;

export type UniversalClassTag =
  (typeof UniversalClassTag)[keyof typeof UniversalClassTag];

export const TagClass = {
  UNIVERSAL: 0,
  APPLICATION: 1,
  CONTEXT_SPECIFIC: 2,
  PRIVATE: 3,
} as const;

export type TagClass = (typeof TagClass)[keyof typeof TagClass];
