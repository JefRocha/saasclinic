import { z } from 'zod';

export const expiringExamSchema = z.object({
  id: z.number(),
  vencimento: z.date(),
  colaboradorNome: z.string(),
  clienteNome: z.string(),
  exameNome: z.string(),
  telefone: z.string().nullable(),
  clienteId: z.number(),
  colaboradorId: z.number(),
});

export type ExpiringExam = z.infer<typeof expiringExamSchema>;

export const getExpiringExamsResponseSchema = z.object({
  data: z.array(expiringExamSchema).optional(),
  message: z.string().optional(),
});
