"use server";

import { z } from "zod";
import { actionClient, ActionError } from "@/libs/safe-action";

const inputSchema = z.object({ cnpj: z.string().min(14).max(18) });

export const getCnpjInfo = actionClient
  .schema(inputSchema)
  .action(async ({ parsedInput }: { parsedInput: z.infer<typeof inputSchema> }) => {
    const cnpj = parsedInput.cnpj.replace(/\D/g, "").padStart(14, "0");
    try {
      const resp = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpj}`, { cache: "no-store" });
      if (!resp.ok) throw new ActionError(`Falha ao consultar CNPJ (${resp.status})`);
      const data = await resp.json();
      if (data?.status !== "OK") throw new ActionError(data?.message ?? "Resposta da API não OK.");
      return {
        cnpj,
        nome: data?.nome ?? null,
        fantasia: data?.fantasia ?? data?.nome ?? null,
        logradouro: data?.logradouro ?? null,
        numero: data?.numero ?? null,
        complemento: data?.complemento ?? null,
        bairro: data?.bairro ?? null,
        municipio: data?.municipio ?? null,
        uf: data?.uf ?? null,
        cep: data?.cep ?? null,
        ie: data?.ie ?? null,
        telefone: data?.telefone ?? null,
        email: data?.email ?? null,
        atividade_principal: Array.isArray(data?.atividade_principal)
          ? data.atividade_principal.map((it: any) => ({ code: it?.code ?? null }))
          : null,
      };
    } catch (e: any) {
      console.error("Erro ao buscar CNPJ:", e);
      throw new ActionError(e?.message ?? "Erro interno ao buscar CNPJ.");
    }
  });
