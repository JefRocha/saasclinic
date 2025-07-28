import { z } from "zod";

export const getContasAPagarDashboardDataSchema = z.object({
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

export type GetContasAPagarDashboardDataSchema = z.infer<typeof getContasAPagarDashboardDataSchema>;

export type GetContasAPagarDashboardDataResult = {
  totalAPagar: number;
  vencidas: number;
  aVencer30Dias: number;
  aVencer60Dias: number;
  aVencer90Dias: number;
};