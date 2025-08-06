import { z } from "zod";

export const deleteAnamneseSchema = z.object({
  id: z.number(),
});
