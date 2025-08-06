"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { examesTable, organizationSchema } from "@/models/Schema";
import { protectedClient, ActionError } from "@/libs/safe-action";
import { upsertExameSchema } from "./schema";
import { buildAbility, Action as CaslAction } from "@/lib/ability";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { clerkClient } from "@clerk/clerk-sdk-node";

export const upsertExame = protectedClient.schema(
  upsertExameSchema,
).action(
  async (parsedInput, { orgId }) => {
    const user = await currentUser();
    const role = user?.publicMetadata?.role as string;
  
    const ability = buildAbility(role, orgId);
    const isEditing = !!parsedInput.id;
  
    // 1. Verificar permissão
    const actionToPerform = isEditing ? CaslAction.Update : CaslAction.Create;
    if (!ability.can(actionToPerform, "Exame")) {
      throw new ActionError("Você não tem permissão para realizar esta ação.");
    }
  
    const finalOrgId = orgId;
  
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
  });
