import { z } from 'zod';
import { colaborador_sex_enum } from '@/models/Schema';

export const upsertColaboradorSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").nullable().optional(),
  endereco: z.string().optional(),
  numero: z.string().nullable().optional(),
  complemento: z.string().nullable().optional(),
  bairro: z.string().nullable().optional(),
  cidade: z.string().nullable().optional(),
  uf: z.string().nullable().optional(),
  cep: z.string().nullable().optional(),
  telefone: z.string().nullable().optional(),
  celular: z.string().nullable().optional(),
  cpf: z.string().nullable().optional(),
  rg: z.string().nullable().optional(),
  ctps: z.string().nullable().optional(),
  data_admissao: z.date().nullable().optional(),
  data_demissao: z.date().nullable().optional(),
  situacao: z.string().nullable().optional(),
  obs1: z.string().nullable().optional(),
  data_nascimento: z.date().nullable().optional(),
  setor: z.string().nullable().optional(),
  cargahoraria: z.string().nullable().optional(),
  prontuario: z.string().nullable().optional(),
  observacao: z.string().nullable().optional(),
  pcd: z.string().nullable().optional(),
  cod_anterior: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  sex: z.enum(colaborador_sex_enum.enumValues, { required_error: "Sexo é obrigatório" }),
});

export type UpsertColaboradorForm = z.infer<typeof upsertColaboradorSchema>;