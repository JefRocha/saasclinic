import { z } from "zod";

export const deleteExameSchema = z.object({
  id: z.number().int().positive(),
});