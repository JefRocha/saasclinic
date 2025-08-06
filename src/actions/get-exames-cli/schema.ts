import { z } from "zod";
import { examesCliTable } from "@/models/Schema";

export const searchExamesCliSchema = z.object({
  clientId: z.union([z.string(), z.number()]).optional().nullable(),
  search: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
  orderBy: z.string().optional(),
  order: z.string().optional(),
});

export type SearchExamesCliSchema = z.infer<typeof searchExamesCliSchema>;

export type SearchExamesCliResult = {
  data: (typeof examesCliTable.$inferSelect & {
    clienteNome?: string;
    exameDescricao?: string;
  })[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};