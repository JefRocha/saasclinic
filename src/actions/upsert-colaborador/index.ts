'use server';

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { colaboradorTable, organizationSchema } from "@/models/Schema";
import { protectedClient, ActionError } from "@/libs/safe-action";
import { upsertColaboradorSchema } from "./schema";
import { buildAbility, Action as CaslAction } from "@/lib/ability";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { ensureOrganizationExistsInDb } from "@/libs/organization-utils";

type ColaboradorDataForDrizzle = {
  [K in keyof typeof colaboradorTable.$inferInsert]: typeof colaboradorTable.$inferInsert[K];
};

export const upsertColaborador = protectedClient
  .schema(upsertColaboradorSchema)
  .action(async ({ parsedInput, ctx: { orgId } }) => {
    const user = await currentUser();
    const role = user?.publicMetadata?.role as string;
  
    const ability = buildAbility(role, orgId);
    const isEditing = !!parsedInput.id;
  
    // 1. Verificar permissão
    const actionToPerform = isEditing ? CaslAction.Update : CaslAction.Create;
    if (!ability.can(actionToPerform, "Colaborador")) {
      throw new ActionError("Você não tem permissão para realizar esta ação.");
    }
  
    // 2. Decidir em qual organização gravar (orgId já vem do contexto)
    const finalOrgId = orgId;

    // 3. Garante que a organização existe no banco de dados local
    await ensureOrganizationExistsInDb(finalOrgId);
  
    // 4. Prepara os dados do cliente
    const colaboradorData: ColaboradorDataForDrizzle = {
      ...parsedInput,
      organizationId: finalOrgId,
      id: parsedInput.id ? Number(parsedInput.id) : undefined,
      createdAt: undefined, // Explicitamente definido como undefined para remover do objeto
      updatedAt: undefined, // Explicitamente definido como undefined para remover do objeto
    };
  
    
  
    try {
      if (isEditing) {
        // Atualização
        const [updatedColaborador] = await db
          .update(colaboradorTable)
          .set(colaboradorData)
          .where(eq(colaboradorTable.id, Number(parsedInput.id)))
          .returning();
  
        if (!updatedColaborador) {
          throw new ActionError("Colaborador não encontrado para atualização.");
        }
        return updatedColaborador;
      } else {
        // Inserção
        const [newColaborador] = await db
          .insert(colaboradorTable)
          .values(colaboradorData)
          .returning();
  
        return newColaborador;
      }
    } catch (error) {
      console.error("Erro ao salvar Colaborador:", error);
      throw new ActionError("Ocorreu um erro inesperado ao salvar o Colaborador.");
    }
  });