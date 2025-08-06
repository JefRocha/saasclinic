import { z } from 'zod';

export const deleteColaboradorSchema = z.object({
  id: z.union([z.string(), z.number()]),
});

export type DeleteColaboradorSchema = z.infer<typeof deleteColaboradorSchema>;
