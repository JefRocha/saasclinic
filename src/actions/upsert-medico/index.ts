"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { medicosTable } from "@/models/Schema";
import { protectedClient, ActionError } from "@/libs/safe-action";
import { upsertMedicoSchema } from "./schema";
import { buildAbility, Action as CaslAction } from "@/lib/ability";
import { eq } from "drizzle-orm";
import { z } from "zod";

// A lógica principal da action, agora usando o contexto do protectedClient
async function handler({ 
  parsedInput,
  ctx: { userId, orgId } 
}: { 
  parsedInput: z.infer<typeof upsertMedicoSchema>; 
  ctx: { userId: string; orgId: string; };
}) {
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string;

  const ability = buildAbility(role, orgId);
  const isEditing = !!parsedInput.id;

  // 1. Verificar permissão
  const actionToPerform = isEditing ? CaslAction.Update : CaslAction.Create;
  if (!ability.can(actionToPerform, "Medico")) {
    throw new ActionError("Você não tem permissão para realizar esta ação.");
  }

  // 2. Decidir em qual organização gravar (orgId já vem do contexto)
  const finalOrgId = orgId;

  // 3. Preparar os dados para o banco (mapeamento explícito para segurança)
  const medicoData = {
    id: parsedInput.id,
    organizationId: finalOrgId,
    nome: parsedInput.nome,
    endereco: parsedInput.endereco || "",
    bairro: parsedInput.bairro || "",
    cidade: parsedInput.cidade || "",
    uf: parsedInput.uf || "",
    cep: parsedInput.cep || "",
    cpf: parsedInput.cpf, // Campo obrigatório, já validado pelo Zod
    telefone: parsedInput.telefone || "",
    celular: parsedInput.celular || "",
    crm: parsedInput.crm || "",
    usaAgenda: parsedInput.usaAgenda ? 1 : 0,
    codAgenda: parsedInput.codAgenda || 0,
    numero: parsedInput.numero || "",
    complemento: parsedInput.complemento || "",
    codiIbge: parsedInput.codiIbge || 0,
    email: parsedInput.email || "",
  };

  try {
    if (isEditing) {
      // Atualização
      const [updatedMedico] = await db
        .update(medicosTable)
        .set(medicoData)
        .where(eq(medicosTable.id, Number(parsedInput.id)))
        .returning();

      if (!updatedMedico) {
        throw new ActionError("Médico não encontrado para atualização.");
      }
      return updatedMedico;
    } else {
      // Inserção
      const [newMedico] = await db
        .insert(medicosTable)
        .values(medicoData)
        .returning();
      
      return newMedico;
    }
  } catch (error) {
    console.error("Erro ao salvar médico:", error);
    throw new ActionError("Ocorreu um erro inesperado ao salvar o médico.");
  }
}

// Exporta a action usando o padrão do projeto e o protectedClient
export const upsertMedico = protectedClient.schema(upsertMedicoSchema).action(handler);
