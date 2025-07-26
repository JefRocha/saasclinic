"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { examesTable } from "@/models/Schema";
import { protectedAction, ActionError } from "@/libs/safe-action";
import { upsertExameSchema } from "./schema";
import { buildAbility, Action as CaslAction } from "@/lib/ability";
import { eq } from "drizzle-orm";
import { z } from "zod";

async function handler({
  parsedInput,
  ctx: { userId, orgId },
}: {
  parsedInput: z.infer<typeof upsertExameSchema>;
  ctx: { userId: string; orgId: string };
}) {
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string;

  const ability = buildAbility(role, orgId);
  const isEditing = !!parsedInput.id;

  // 1. Verificar permissão
  const actionToPerform = isEditing ? CaslAction.Update : CaslAction.Create;
  if (!ability.can(actionToPerform, "Exame")) {
    throw new ActionError("Você não tem permissão para realizar esta ação.");
  }

  // 2. Decidir em qual organização gravar (orgId já vem do contexto)
  const finalOrgId = orgId;

  // 3. Preparar os dados para o banco (mapeamento explícito para segurança)
  const exameData = {
    id: parsedInput.id,
    organizationId: finalOrgId,
    descricao: parsedInput.descricao,
    validade: parsedInput.validade,
    validade1: parsedInput.validade1,
    valor: parsedInput.valor,
    pedido: parsedInput.pedido,
    codigo_anterior: parsedInput.codigo_anterior || null,
    tipo: parsedInput.tipo,
  };

  try {
    if (isEditing) {
      // Atualização
      const [updatedExame] = await db
        .update(examesTable)
        .set(exameData)
        .where(eq(examesTable.id, Number(parsedInput.id)))
        .returning();

      if (!updatedExame) {
        throw new ActionError("Exame não encontrado para atualização.");
      }
      return updatedExame;
    } else {
      // Inserção
      const [newExame] = await db
        .insert(examesTable)
        .values(exameData)
        .returning();

      return newExame;
    }
  } catch (error) {
    console.error("Erro ao salvar exame:", error);
    throw new ActionError("Ocorreu um erro inesperado ao salvar o exame.");
  }
}

export const upsertExame = async (input: z.infer<typeof upsertExameSchema>) => {
  return protectedAction.schema(upsertExameSchema).action(handler)(input);
};
