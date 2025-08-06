import { z } from 'zod';
import { anamneseItemSchema } from "../upsert-anamnese/schema";

export const searchAnamnesesSchema = z.object({
  search: z.string().optional(),
  page: z.number().min(1).optional().default(1),
  orderBy: z.string().optional().default("id"),
  order: z.enum(["asc", "desc"]).optional().default("asc"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type SearchAnamnesesInput = z.infer<typeof searchAnamnesesSchema>;

export type Anamnese = {
  id: number;
  clienteId: number;
  colaboradorId: number;
  data: Date;
  formapagto: string;
  tipo: string;
  cargo: string;
  setor: string | null;
  solicitante: string | null;
  status: string | null;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
  atendenteId: string;
  clienteRazaoSocial: string;
  clienteFantasia: string | null;
  colaboradorNome: string;
  items: z.infer<typeof anamneseItemSchema>[]; // Adicionado o array de itens
};

export type SearchAnamnesesResult = {
  data: Anamnese[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};