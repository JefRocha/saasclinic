'use server';

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { examesTable, organizationSchema } from "@/models/Schema";
import { protectedClient, ActionError } from "@/libs/safe-action";
import { upsertExameSchema } from "./schema";
import { buildAbility, Action as CaslAction } from "@/lib/ability";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { clerkClient } from "@clerk/clerk-sdk-node";

type ExameDataForDrizzle = {
  [K in keyof typeof examesTable.$inferInsert]: typeof examesTable.$inferInsert[K];
};

export const upsertExame = protectedClient
  .schema(upsertExameSchema)
  .action(async ({ parsedInput, ctx: { orgId } }) => {
    const user = await currentUser();
    const role = user?.publicMetadata?.role as string;
  
    const ability = buildAbility(role, orgId);
    const isEditing = !!parsedInput.id;
  
    // 1. Verificar permissão
    const actionToPerform = isEditing ? CaslAction.Update : CaslAction.Create;
    if (!ability.can(actionToPerform, "Client")) {
      throw new ActionError("Você não tem permissão para realizar esta ação.");
    }
  
    // 2. Decidir em qual organização gravar (orgId já vem do contexto)
    const finalOrgId = orgId;
  
    // 4. Prepara os dados do cliente
    const exameData: ExameDataForDrizzle = {
      ...parsedInput,
      organizationId: finalOrgId,
      id: parsedInput.id ? Number(parsedInput.id) : undefined,
      createdAt: undefined, // Explicitamente definido como undefined para remover do objeto
      updatedAt: undefined, // Explicitamente definido como undefined para remover do objeto
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
          throw new ActionError("Cliente não encontrado para atualização.");
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
      console.error("Erro ao salvar cliente:", error);
      throw new ActionError("Ocorreu um erro inesperado ao salvar o cliente.");
    }
  });