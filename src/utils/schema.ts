import * as v from "valibot";
import { TagClass } from "../const";

export const idSchemaFactory = (id: {
  tagType: number;
  tagClass: TagClass;
  isConstructed: boolean;
}) =>
  v.object({
    tagClass: v.literal(id.tagClass),
    isConstructed: v.literal(id.isConstructed),
    tagType: v.literal(id.tagType),
  });
