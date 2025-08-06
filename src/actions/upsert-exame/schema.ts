import { z } from "zod";
import { examesTable } from "@/models/Schema";

export const upsertExameSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  organizationId: z.string().optional().nullable(),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  validade: z.coerce.number().min(1, "Validade é obrigatória"),
  validade1: z.coerce.number().min(1, "Validade 1 é obrigatória"),
  valor: z.coerce.number().min(0, "Valor deve ser positivo"),
  pedido: z.enum(["Sim", "Não"], { required_error: "Pedido é obrigatório" }),
  codigo_anterior: z.string().optional().nullable(),
  tipo: z.enum([
    "ADMISSIONAL",
    "PERIODICO",
    "MUDANCA FUNCAO",
    "RE. AO TRABALHO",
    "DEMISSIONAL",
    "OUTROS",
    "PCMSO",
    "PPRA",
    "LCAT",
    "PCMAT",
    "ART",
    "PCA",
    "SESMET",
    "CONSULTA MEDICA",
    "ATESTADO SAN",
    "HOMOL. ATESTADO",
  ], { required_error: "Tipo é obrigatório" }),
  createdAt: z.coerce.date().optional().nullable(),
  updatedAt: z.coerce.date().optional().nullable(),
});

export const searchExamesSchema = z.object({
  search: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
  orderBy: z.string().optional(),
  order: z.string().optional(),
});

export type upsertExameSchema = z.infer<typeof upsertExameSchema>;
export type searchExamesSchema = z.infer<typeof searchExamesSchema>;

export type SearchExamesResult = {
  data: typeof examesTable.$inferSelect[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};