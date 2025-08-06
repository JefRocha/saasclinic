import { z } from "zod";

export const getCnpjInputSchema = z.object({
  cnpj: z.string().min(14, "CNPJ inválido"),
});

export const cnpjPayloadSchema = z.object({
  cnpj: z.string(),
  nome: z.string().nullish(),
  fantasia: z.string().nullish(),
  logradouro: z.string().nullish(),
  numero: z.string().nullish(),
  complemento: z.string().nullish(),
  bairro: z.string().nullish(),
  municipio: z.string().nullish(),
  uf: z.string().nullish(),
  cep: z.string().nullish(),
  ie: z.string().nullish(),
  telefone: z.string().nullish(),
  email: z.string().nullish(),
  atividade_principal: z.array(z.object({ code: z.string().nullish() })).nullish(),
});

export type CnpjPayload = z.infer<typeof cnpjPayloadSchema>;
