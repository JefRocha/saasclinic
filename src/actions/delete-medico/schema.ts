import { z } from "zod";

export const deleteMedicoSchema = z.object({
  id: z.number().int().positive(),
});