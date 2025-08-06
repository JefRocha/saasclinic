'use server';

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { clientsTable, organizationSchema } from "@/models/Schema";
import { protectedClient, ActionError } from "@/libs/safe-action";
import { upsertClientSchema } from "./schema";
import { buildAbility, Action as CaslAction } from "@/lib/ability";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { clerkClient } from "@clerk/clerk-sdk-node";

type ClientDataForDrizzle = {
  [K in keyof typeof clientsTable.$inferInsert]: typeof clientsTable.$inferInsert[K];
};

export const upsertClient = protectedClient
  .schema(upsertClientSchema)
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
    const clientData: ClientDataForDrizzle = {
      ...parsedInput,
      organizationId: finalOrgId,
      id: parsedInput.id ? Number(parsedInput.id) : undefined,
      vlrMens: parsedInput.vlrMens !== undefined && parsedInput.vlrMens !== null ? String(parsedInput.vlrMens) : undefined,
      travado: parsedInput.travado !== undefined && parsedInput.travado !== null ? Boolean(parsedInput.travado) : undefined,
      createdAt: undefined, // Explicitamente definido como undefined para remover do objeto
      updatedAt: undefined, // Explicitamente definido como undefined para remover do objeto
    };
  
    
  
    try {
      if (isEditing) {
        // Atualização
        const [updatedClient] = await db
          .update(clientsTable)
          .set(clientData)
          .where(eq(clientsTable.id, Number(parsedInput.id)))
          .returning();
  
        if (!updatedClient) {
          throw new ActionError("Cliente não encontrado para atualização.");
        }
        return updatedClient;
      } else {
        // Inserção
        const [newClient] = await db
          .insert(clientsTable)
          .values(clientData)
          .returning();
  
        return newClient;
      }
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      throw new ActionError("Ocorreu um erro inesperado ao salvar o cliente.");
    }
  });