'use server';

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { clientsTable } from "@/models/Schema";
import { protectedClient, ActionError } from "@/libs/safe-action";
import { searchClientsSchema } from "@/actions/upsert-client/schema";
import { buildAbility, Action as CaslAction } from "@/lib/ability";
import { eq, and, ilike, sql } from "drizzle-orm";

export const getClients = protectedClient.schema(
  searchClientsSchema,
).action(async ({ parsedInput, ctx }) => {
    const { search, page, order, orderBy } = parsedInput;
    const { orgId } = ctx;
    const user = await currentUser();
    const role = user?.publicMetadata?.role as string;

    const ability = buildAbility(role, orgId);
    if (!ability.can(CaslAction.Read, "Client")) {
      throw new ActionError("Você não tem permissão para ler dados de clientes.");
    }

    const limit = 10;
    const offset = (page && page > 0 ? page - 1 : 0) * limit;

    const whereOrg = eq(clientsTable.organizationId, orgId); // Sempre filtra por orgId

    const where = and(
      whereOrg,
      search ? ilike(clientsTable.razaoSocial, `%${search}%`) : undefined
    );

    const validOrderByColumns = ['id', 'razaoSocial', 'fantasia', 'createdAt', 'updatedAt']; // Adicione outras colunas válidas aqui
    const finalOrderBy = (orderBy && validOrderByColumns.includes(orderBy)) ? orderBy : 'id';

    const orderByColumn = clientsTable[finalOrderBy as keyof typeof clientsTable];

    try {
      const [clients, [{ count } = { count: 0 }]] = await Promise.all([
        db
          .select()
          .from(clientsTable)
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
          .from(clientsTable)
          .where(where),
      ]);

      return {
        data: clients.map(client => ({
          ...client,
          vlrMens: client.vlrMens !== null && client.vlrMens !== undefined ? Number(client.vlrMens) : undefined,
        })),
        pagination: { page: page || 1, limit, total: count, totalPages: Math.ceil(count / limit) },
      };
    } catch (e) {
      console.error("Erro ao buscar clientes na Server Action:", e);
      throw new ActionError("Erro interno ao buscar clientes.");
    }
  });
