'use server';

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { clientsTable, organizationSchema } from "@/models/Schema";
import { protectedAction, ActionError } from "@/libs/safe-action";
import { upsertClientSchema } from "./schema";
import { buildAbility, Action as CaslAction } from "@/lib/ability";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { clerkClient } from "@clerk/clerk-sdk-node";

type ClientDataForDrizzle = {
  [K in keyof typeof clientsTable.$inferInsert]: typeof clientsTable.$inferInsert[K];
};

async function handler({
  parsedInput,
  ctx: { orgId },
}: {
  parsedInput: z.infer<typeof upsertClientSchema>;
  ctx: { orgId: string };
}) {
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

  // 3. Garante que a organização existe na tabela local
  const [org] = await db
    .select()
    .from(organizationSchema)
    .where(eq(organizationSchema.id, finalOrgId))
    .limit(1);

  if (!org) {
    // Busca dados diretamente no Clerk
    const clerkOrg = await clerkClient.organizations.getOrganization({
      organizationId: finalOrgId,
    });

    // clerkOrg.name sempre existe; created_at vem como epoch ms
    const now = new Date();

    // Faz UPSERT (ignora se outra req já inseriu)
    await db
      .insert(organizationSchema)
      .values({
        id: clerkOrg.id,
        nome: clerkOrg.name,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing();
  }

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
}

export const upsertClient = async (input: z.infer<typeof upsertClientSchema>) => {
  return protectedAction.schema(upsertClientSchema).action(handler)(input);
};