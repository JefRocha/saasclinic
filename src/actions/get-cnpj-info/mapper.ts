import type { CnpjPayload } from "./schema";

export function mapFromApi(raw: any, cnpjLimpo: string): CnpjPayload {
  return {
    cnpj: cnpjLimpo,
    nome: raw?.razao_social ?? raw?.nome ?? null,
    fantasia: raw?.nome_fantasia ?? raw?.fantasia ?? raw?.razao_social ?? null,
    logradouro: raw?.logradouro ?? null,
    numero: raw?.numero ?? null,
    complemento: raw?.complemento ?? null,
    bairro: raw?.bairro ?? null,
    municipio: raw?.municipio ?? raw?.cidade ?? null,
    uf: raw?.uf ?? null,
    cep: raw?.cep ?? null,
    ie: raw?.inscricao_estadual ?? raw?.ie ?? null,
    telefone: raw?.telefone ?? null,
    email: raw?.email ?? null,
    atividade_principal: raw?.atividade_principal ?? null,
  };
}
