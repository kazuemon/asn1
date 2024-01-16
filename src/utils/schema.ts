import * as v from "valibot";
import { Asn1Data } from "..";

export const idSchemaFactory = (id: Asn1Data["id"]) =>
  v.object({
    tagClass: v.literal(id.tagClass),
    isConstructed: v.literal(id.isConstructed),
    tagType: v.literal(id.tagType),
  });
