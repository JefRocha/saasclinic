"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { examesTable } from "@/models/Schema";
import { protectedAction, ActionError } from "@/libs/safe-action";
import { searchExamesSchema } from "@/actions/upsert-exame/schema"; // Reutiliza o schema de busca
import { buildAbility, Action as CaslAction } from "@/lib/ability";
import { eq, and, ilike, sql } from "drizzle-orm";
import { z } from "zod";

export const getExames = protectedAction
  .schema(searchExamesSchema)
  .action(async ({ parsedInput, ctx: { orgId } }) => {
    const user = await currentUser();
    const role = user?.publicMetadata?.role as string;

    const ability = buildAbility(role, orgId);
    if (!ability.can(CaslAction.Read, "Exame")) {
      throw new ActionError("Você não tem permissão para ler dados de exames.");
    }

    const { search, page, order, orderBy } = parsedInput;
    const limit = 10;
    const offset = (page && page > 0 ? page - 1 : 0) * limit;

    const whereOrg = eq(examesTable.organizationId, orgId); // Sempre filtra por orgId

    const where = and(
      whereOrg,
      search ? ilike(examesTable.descricao, `%${search}%`) : undefined
    );

    try {
      const [exames, [{ count } = { count: 0 }]] = await Promise.all([
        db
          .select()
          .from(examesTable)
          .where(where)
          .orderBy(
            order === "desc"
              ? sql`${examesTable[orderBy]} DESC`
              : sql`${examesTable[orderBy]} ASC`
          )
          .limit(limit)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(examesTable)
          .where(where),
      ]);

      return {
        data: exames,
        pagination: { page: page || 1, limit, total: count, totalPages: Math.ceil(count / limit) },
      };
    } catch (e) {
      console.error("Erro ao buscar exames na Server Action:", e);
      throw new ActionError("Erro interno ao buscar exames.");
    }
  });
