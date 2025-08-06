import { z } from 'zod';

export const upsertClientExamSchema = z.object({
  id: z.number().optional(),
  clientId: z.number(),
  exameId: z.number(),
  valor: z.number(),
});

export type UpsertClientExamInput = z.infer<typeof upsertClientExamSchema>;
