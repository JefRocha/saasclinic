'use server';

import { db } from "@/db";
import { anamneseTable, clientsTable, colaboradorTable } from '@/models/Schema';
import { protectedClient, ActionError } from "@/libs/safe-action";
import { searchAnamnesesSchema } from "./schema"; 
import { buildAbility, Action as CaslAction } from "@/lib/ability";
import { and, eq, ilike, asc, desc, gte, lte, sql, inArray } from 'drizzle-orm';

export const getAnamneses = protectedClient.schema(
  searchAnamnesesSchema,
).action(async ({ parsedInput, ctx }) => {
    const { search, page, order, orderBy, startDate, endDate } = parsedInput;
    const { orgId } = ctx;

    const limit = 10;
    const offset = (page && page > 0 ? page - 1 : 0) * limit;

    const where = and(
      eq(anamneseTable.organizationId, orgId),
      startDate ? gte(anamneseTable.data, new Date(startDate)) : undefined,
      endDate ? lte(anamneseTable.data, new Date(endDate)) : undefined,
      search ? ilike(clientsTable.razaoSocial, `%${search}%`) : undefined
    );

    const validOrderByColumns = {
      'id': anamneseTable.id,
      'data': anamneseTable.data,
      'cargo': anamneseTable.cargo,
      'razaoSocial': clientsTable.razaoSocial,
      'createdAt': anamneseTable.createdAt,
    };

    const finalOrderBy = (orderBy && orderBy in validOrderByColumns) ? orderBy : 'id';
    const orderByColumn = validOrderByColumns[finalOrderBy as keyof typeof validOrderByColumns];

    try {
      const anamneseIdsQuery = db
        .select({ id: anamneseTable.id })
        .from(anamneseTable)
        .leftJoin(clientsTable, eq(anamneseTable.clienteId, clientsTable.id))
        .where(where)
        .orderBy(order === "desc" ? desc(orderByColumn) : asc(orderByColumn))
        .limit(limit)
        .offset(offset);

      const totalQuery = db
        .select({ count: sql<number>`count(*)` })
        .from(anamneseTable)
        .leftJoin(clientsTable, eq(anamneseTable.clienteId, clientsTable.id))
        .where(where);

      const [anamneseIdsResult, [{ count } = { count: 0 }]] = await Promise.all([
        anamneseIdsQuery,
        totalQuery,
      ]);

      if (anamneseIdsResult.length === 0) {
        return { data: [], pagination: { page: page || 1, limit, total: 0, totalPages: 0 } };
      }

      const ids = anamneseIdsResult.map(a => a.id);

      const anamneses = await db.query.anamneseTable.findMany({
        where: inArray(anamneseTable.id, ids),
        with: {
          items: true,
          cliente: { columns: { razaoSocial: true, fantasia: true } },
          colaborador: { columns: { name: true } },
        },
        orderBy: (order === "desc" ? desc(orderByColumn) : asc(orderByColumn)),
      });

      
      const data = anamneses.map(a => ({
        ...a,
        clienteRazaoSocial: a.cliente?.razaoSocial ?? '',
        clienteFantasia: a.cliente?.fantasia ?? '',
        colaboradorNome: a.colaborador?.name ?? '',
      }));

      return {
        data,
        pagination: { 
          page: page || 1, 
          limit, 
          total: count, 
          totalPages: Math.ceil(count / limit) 
        },
      };
    } catch (e) {
      console.error("Erro ao buscar anamneses na Server Action:", e);
      throw new ActionError("Erro interno ao buscar anamneses.");
    }
  });

