'use server';

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { examesCliTable, clientsTable, examesTable } from "@/models/Schema";
import { protectedClient, ActionError } from "@/libs/safe-action";
import { searchExamesCliSchema } from "./schema";
import { buildAbility, Action as CaslAction } from "@/lib/ability";
import { eq, and, ilike, sql } from "drizzle-orm";

export const getExamesCli = protectedClient.schema(
  searchExamesCliSchema,
).action(
  async ({ clientId, search, page, order, orderBy }, { orgId }) => {
    const user = await currentUser();
    const role = user?.publicMetadata?.role as string;

    const ability = buildAbility(role, orgId);
    if (!ability.can(CaslAction.Read, "ExameCli")) { // Assumindo que você terá uma permissão para ExameCli
      throw new ActionError("Você não tem permissão para ler dados de exames por cliente.");
    }

    const limit = 10;
    const offset = (page && page > 0 ? page - 1 : 0) * limit;

    // 1. Buscar IDs de clientes da organização
    const orgClients = await db
      .select({ id: clientsTable.id })
      .from(clientsTable)
      .where(eq(clientsTable.organizationId, orgId));

    const orgClientIds = orgClients.map(client => client.id);

    // 2. Construir a condição WHERE
    const whereConditions = [
      sql`${examesCliTable.idcliente} IN ${orgClientIds}`, // Filtra por clientes da organização
    ];

    if (clientId) {
      whereConditions.push(eq(examesCliTable.idcliente, Number(clientId)));
    }

    if (search) {
      whereConditions.push(ilike(examesCliTable.descricao, `%${search}%`));
    }

    const where = and(...whereConditions);

    const validOrderByColumns = ['id', 'descricao', 'valor', 'cargo', 'codExameAnt'];
    const finalOrderBy = (orderBy && validOrderByColumns.includes(orderBy)) ? orderBy : 'id';

    const orderByColumn = examesCliTable[finalOrderBy as keyof typeof examesCliTable];

    try {
      const [examesCli, [{ count } = { count: 0 }]] = await Promise.all([
        db
          .select({
            id: examesCliTable.id,
            idcliente: examesCliTable.idcliente,
            idexame: examesCliTable.idexame,
            descricao: examesCliTable.descricao,
            valor: examesCliTable.valor,
            cargo: examesCliTable.cargo,
            codExameAnt: examesCliTable.codExameAnt,
            clienteNome: clientsTable.razaoSocial, // Adiciona o nome do cliente
            exameDescricao: examesTable.descricao, // Adiciona a descrição do exame
          })
          .from(examesCliTable)
          .leftJoin(clientsTable, eq(examesCliTable.idcliente, clientsTable.id))
          .leftJoin(examesTable, eq(examesCliTable.idexame, examesTable.id))
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
          .from(examesCliTable)
          .leftJoin(clientsTable, eq(examesCliTable.idcliente, clientsTable.id))
          .where(where),
      ]);

      return {
        data: examesCli,
        pagination: { page: page || 1, limit, total: count, totalPages: Math.ceil(count / limit) },
      };
    } catch (e) {
      console.error("Erro ao buscar exames por cliente na Server Action:", e);
      throw new ActionError("Erro interno ao buscar exames por cliente.");
    }
  });