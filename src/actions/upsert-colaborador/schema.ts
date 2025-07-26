import { z } from 'zod';
import { colaboradorTable } from '@/models/Schema';
import { isValidCpf } from '@/helpers/validation'; // Assumindo que esta função já existe

export const upsertColaboradorSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  organizationId: z.string().uuid().optional().nullable(),
  name: z.string().min(1, "Nome é obrigatório."),
  email: z.string().email("E-mail inválido.").min(1, "E-mail é obrigatório."),
  endereco: z.string().optional().nullable(),
  numero: z.string().optional().nullable(),
  complemento: z.string().optional().nullable(),
  bairro: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  uf: z.string().optional().nullable(),
  cep: z.string().optional().nullable(),
  telefone: z.string().optional().nullable(),
  celular: z.string().optional().nullable(),
  cpf: z.string().optional().nullable(),
  rg: z.string().optional().nullable(),
  ctps: z.string().optional().nullable(),
  data_admissao: z.coerce.date().optional().nullable(),
  data_demissao: z.coerce.date().optional().nullable(),
  situacao: z.string().optional().nullable(),
  obs1: z.string().optional().nullable(),
  data_nascimento: z.coerce.date().optional().nullable(),
  setor: z.string().optional().nullable(),
  cargahoraria: z.string().optional().nullable(),
  prontuario: z.string().optional().nullable(),
  observacao: z.string().optional().nullable(),
  pcd: z.string().optional().nullable(),
  cod_anterior: z.string().optional().nullable(),
  phoneNumber: z.string().min(1, "Número de telefone é obrigatório."),
  sex: z.enum(["male", "female"], { required_error: "Sexo é obrigatório." }),
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

export const searchColaboradoresSchema = z.object({
  search: z.string().optional(),
  page: z.number().default(1),
  orderBy: z.string().default('name'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export type SearchColaboradoresResult = {
  data: typeof colaboradorTable.$inferSelect[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type UpsertColaboradorSchema = z.infer<typeof upsertColaboradorSchema>;
export type SearchColaboradoresSchema = z.infer<typeof searchColaboradoresSchema>;
