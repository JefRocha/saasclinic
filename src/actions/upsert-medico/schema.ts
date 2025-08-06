import { z } from "zod";

import { isValidCpf } from "@/helpers/validation";

export const upsertMedicoSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  organizationId: z.string().optional(),
  nome: z.string().min(1, "Nome é obrigatório"),
  endereco: z.string().optional().nullable(),
  bairro: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  uf: z.string().optional().nullable(),
  cep: z.string().optional().nullable(),
  cpf: z.string().min(11, "CPF é obrigatório"),
  telefone: z.string(),
  celular: z.string(),
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
  // if (data.organizationId && data.organizationId !== "") {
  //   const uuidRegex =
  //     /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  //   if (!uuidRegex.test(data.organizationId)) {
  //     ctx.addIssue({
  //       code: z.ZodIssueCode.custom,
  //       message: "ID da organização inválido (não é um UUID válido).",
  //       path: ["organizationId"],
  //     });
  //   }
  // }
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