"use server";

import { z } from "zod";

import { action } from "@/libs/safe-action";

const schema = z.object({
  cnpj: z.string().min(14, "CNPJ inválido").max(18, "CNPJ inválido"),
});

async function getCnpjData({ parsedInput }: { parsedInput: { cnpj: string } }) {
  const { cnpj } = parsedInput;
  try {
    const cleanedCnpj = cnpj.replace(/\D/g, '').padStart(14, '0');
    const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cleanedCnpj}`);
    console.log("Server Action - ReceitaWS Response Status:", response.status);

    const contentType = response.headers.get("content-type");
    if (!response.ok || !contentType || !contentType.includes("application/json")) {
      const errorText = await response.text();
      console.error("Server Action - ReceitaWS Non-JSON/Error Response:", errorText);
      return { success: false, error: `Erro na API da ReceitaWS: ${errorText}` };
    }

    const data = await response.json();
    console.log("Server Action - ReceitaWS Response Data:", data);

    if (response.status === 200 && data.status !== "ERROR") {
      return { success: true, data };
    } else {
      return { success: false, error: data.message || "Erro ao buscar CNPJ." };
    }
  } catch (error: any) {
    console.error("Erro ao buscar CNPJ na Server Action:", error);
    return { success: false, error: error.message || "Erro interno do servidor." };
  }
}

export const getCnpjInfo = async (input: { cnpj: string }) => {
  return action.schema(schema).action(getCnpjData)(input);
};