import { and, asc, desc, eq, gte, ilike, lte, AnyColumn } from "drizzle-orm";
import { protectedAction, ActionError } from "@/libs/safe-action";
import { z } from "zod";
import { db } from "@/db";
import { anamneseTable } from "@/models/Schema";

import { currentUser } from "@clerk/nextjs/server";
// ... outras importações

export const getAnamneses = protectedAction
  .schema(
    z.object({
      search: z.string().optional(),
      orderBy: z.string().optional(),
      order: z.enum(["asc", "desc"]).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
  )
  .action(async ({ parsedInput, ctx: { orgId } }) => {
    const { search, orderBy, order, startDate, endDate } = parsedInput;
    const user = await currentUser();

    if (!user) {
      throw new ActionError("Usuário não autenticado.");
    }

    const where = [];

    // Filtro por organização
    where.push(eq(anamneseTable.organizationId, orgId));

    // Filtro de busca
    if (search) {
      where.push(
        ilike(anamneseTable.cargo, `%${search}%`) // Exemplo: busca por cargo
        // Adicione outros campos para busca se necessário
      );
    }

    // Filtro por data
    if (startDate) {
      where.push(gte(anamneseTable.data, new Date(startDate)));
    }
    if (endDate) {
      where.push(lte(anamneseTable.data, new Date(endDate)));
    }

    const validOrderByColumns = ["id", "data", "formaPagto", "total", "tipo", "cargo", "createdAt", "updatedAt"]; // Adicione todas as colunas que podem ser ordenadas
    const finalOrderByColumn = (orderBy && validOrderByColumns.includes(orderBy)) ? orderBy : "id";
    const orderDirection = order === "desc" ? desc : asc;

    const anamneses = await db
      .select()
      .from(anamneseTable)
      .where(and(...where))
      .orderBy(orderDirection(anamneseTable[finalOrderByColumn as keyof typeof anamneseTable] as AnyColumn));

    return { data: anamneses };
  });
