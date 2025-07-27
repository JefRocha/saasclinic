'use server';

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { clientsTable } from "@/models/Schema";
import { protectedAction, ActionError } from "@/libs/safe-action";
import { buildAbility, Action as CaslAction } from "@/lib/ability";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const getClientsForSelect = protectedAction
  .schema(z.object({})) // Não precisa de input específico, apenas o orgId do contexto
  .action(async ({ ctx: { orgId } }) => {
    const user = await currentUser();
    const role = user?.publicMetadata?.role as string;

    const ability = buildAbility(role, orgId);
    if (!ability.can(CaslAction.Read, "Client")) {
      throw new ActionError("Você não tem permissão para ler dados de clientes.");
    }

    try {
      const clients = await db
        .select({
          id: clientsTable.id,
          name: clientsTable.razaoSocial, // Ou fantasia, dependendo do que você quer exibir
        })
        .from(clientsTable)
        .where(eq(clientsTable.organizationId, orgId))
        .orderBy(clientsTable.razaoSocial);

      return clients;
    } catch (e) {
      console.error("Erro ao buscar clientes para select:", e);
      throw new ActionError("Erro interno ao buscar clientes para seleção.");
    }
  });