import { z } from "zod";

export const exportExamesCliSchema = z.object({
  clientId: z.union([z.string(), z.number()]).optional().nullable(),
  search: z.string().optional(),
});

export type ExportExamesCliSchema = z.infer<typeof exportExamesCliSchema>;