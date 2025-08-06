import { z } from 'zod';

export const GetExamValueSchema = z.object({
  exameId: z.number().int(),
  clienteId: z.number().int().optional().nullable(),
});

export type GetExamValueInput = z.infer<typeof GetExamValueSchema>;
