"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { organizationSchema } from "@/models/Schema";
import { protectedClient, ActionError } from "@/libs/safe-action";
import { buildAbility, Action as CaslAction } from "@/lib/ability";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Schema de entrada vazio, pois não há parâmetros para a busca de todas as organizações
const inputSchema = z.object({});

export const getOrganizations = protectedClient.schema(
  inputSchema,
).action(
  async ({ orgId }) => {
    const user = await currentUser();
    const role = user?.publicMetadata?.role as string;

    const ability = buildAbility(role, orgId);

    if (!ability.can(CaslAction.Read, "Organization")) {
      throw new ActionError("Você não tem permissão para ler dados de organizações.");
    }

    try {
      // super_admin vê todas; outros veem só a própria org
      const orgs = ability.can(CaslAction.Manage, "all")
        ? await db.select().from(organizationSchema).orderBy(organizationSchema.nome)
        : await db.select().from(organizationSchema).where(eq(organizationSchema.id, orgId));

      return { data: orgs }; // Retorna um objeto com a propriedade 'data'
    } catch (e) {
      console.error("Erro ao buscar organizações na Server Action:", e);
      throw new ActionError("Erro interno ao buscar organizações.");
    }
  });
