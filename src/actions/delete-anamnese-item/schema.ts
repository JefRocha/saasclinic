import { z } from "zod";

export const deleteAnamneseItemSchema = z.object({
  anamneseId: z.number(),
  itemId: z.number(),
});
