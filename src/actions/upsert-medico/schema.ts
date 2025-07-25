import { z } from "zod";

import { isValidCpf } from "@/helpers/validation";

export const upsertMedicoSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  organizationId: z.string().uuid().optional().nullable(),
  nome: z.string().min(1, "Nome é obrigatório"),
  endereco: z.string().optional().nullable(),
  bairro: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  uf: z.string().optional().nullable(),
  cep: z.string().optional().nullable(),
  cpf: z.string().optional().nullable(),
  telefone: z.string().optional().nullable(),
  celular: z.string().optional().nullable(),
  crm: z.string().optional().nullable(),
  usaAgenda: z.coerce.number().optional().nullable(),
  codAgenda: z.coerce.number().optional().nullable(),
  numero: z.string().optional().nullable(),
  complemento: z.string().optional().nullable(),
  codiIbge: z.coerce.number().optional().nullable(),
  email: z.string().email("E-mail inválido").optional().nullable(),
  createdAt: z.coerce.date().optional().nullable(),
  updatedAt: z.coerce.date().optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.cpf) {
    const cleanedCpf = data.cpf.replace(/\D/g, '');
    if (!isValidCpf(cleanedCpf)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CPF inválido",
        path: ["cpf"],
      });
    }
  }
});

export const searchMedicosSchema = z.object({
  search: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
  orderBy: z.string().optional(),
  order: z.string().optional(),
});

export type upsertMedicoSchema = z.infer<typeof upsertMedicoSchema>;
export type searchMedicosSchema = z.infer<typeof searchMedicosSchema>;

export type SearchMedicosResult = {
  data: any[]; // Será tipado corretamente depois
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};