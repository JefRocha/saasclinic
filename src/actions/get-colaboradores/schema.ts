import { z } from 'zod';

export const searchColaboradoresSchema = z.object({
  search: z.string().optional(),
  page: z.number().optional(),
  order: z.enum(['asc', 'desc']).optional(),
  orderBy: z.string().optional(),
});

export type SearchColaboradoresInput = z.infer<typeof searchColaboradoresSchema>;
