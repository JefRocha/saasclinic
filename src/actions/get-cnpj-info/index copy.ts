"use server";

import { z } from "zod";

import { actionClient } from "@/libs/safe-action";

import { ActionError } from "@/libs/action-error";

const schema = z.object({
  cnpj: z.string().min(14, "CNPJ inválido").max(18, "CNPJ inválido"),
});

const executeCnpjSearchAction = async (parsedInput: z.infer<typeof schema>) => {
  const { cnpj } = parsedInput;
  try {
    const cleanedCnpj = cnpj.replace(/\D/g, '').padStart(14, '0');
    const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cleanedCnpj}`);
    console.log("Server Action - ReceitaWS Response Status:", response.status);
    
    const data = await response.json();
    console.log("Server Action - ReceitaWS Data:", data);

    if (data.status === "OK") {
      return { success: true, data };
    } else {
      throw new ActionError(data.message || "Erro ao buscar CNPJ: Resposta da API não OK.");
    }
  } catch (error: any) {
    console.error("Erro ao buscar CNPJ na Server Action:", error);
    console.error("Full error object in getCnpjInfo catch:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    throw new ActionError(error.message || "Erro interno do servidor.");
  }
};

export const getCnpjInfo = actionClient.action(
  schema,
  executeCnpjSearchAction
);