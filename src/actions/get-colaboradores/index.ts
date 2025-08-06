'use server';

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { colaboradorTable } from "@/models/Schema";
import { protectedClient, ActionError } from "@/libs/safe-action";
import { searchColaboradoresSchema } from "./schema"; // Importação corrigida
import { buildAbility, Action as CaslAction } from "@/lib/ability";
import { eq, and, ilike, sql } from "drizzle-orm";

export const getColaboradores = protectedClient.schema(
  searchColaboradoresSchema,
).action(async ({ parsedInput, ctx }) => {
    const { orgId } = ctx;
    console.log('DEBUG getColaboradores: orgId', orgId);
    const user = await currentUser();
    const role = user?.publicMetadata?.role as string;

    const ability = buildAbility(role, orgId);
    if (!ability.can(CaslAction.Read, "Colaborador")) {
      throw new ActionError("Você não tem permissão para ler dados de colaboradores.");
    }

    const { search, page, order, orderBy } = parsedInput;
    const limit = 10;
    const offset = (page && page > 0 ? page - 1 : 0) * limit;

    const whereOrg = eq(colaboradorTable.organizationId, orgId); // Sempre filtra por orgId

    const where = and(
      whereOrg,
      search ? ilike(colaboradorTable.name, `%${search}%`) : undefined
    );
    console.log('DEBUG getColaboradores: where clause', where);

    const validOrderByColumns = ['id', 'name', 'cpf', 'email', 'createdAt', 'updatedAt']; // Adicione outras colunas válidas aqui
    const finalOrderBy = (orderBy && validOrderByColumns.includes(orderBy)) ? orderBy : 'id';

    const orderByColumn = colaboradorTable[finalOrderBy as keyof typeof colaboradorTable];

    try {
      const [colaboradores, [{ count } = { count: 0 }]] = await Promise.all([
        db
          .select()
          .from(colaboradorTable)
          .where(where)
          .orderBy(
            order === "desc"
              ? sql`${orderByColumn} DESC`
              : sql`${orderByColumn} ASC`
          )
          .limit(limit)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(colaboradorTable)
          .where(where),
      ]);

      console.log('DEBUG getColaboradores: colaboradores', colaboradores);
      console.log('DEBUG getColaboradores: count', count);

      return {
        data: colaboradores,
        pagination: { page: page || 1, limit, total: count, totalPages: Math.ceil(count / limit) },
      };
    } catch (e) {
      console.error("Erro ao buscar colaboradores na Server Action:", e);
      throw new ActionError("Erro interno ao buscar colaboradores.");
    }
  });