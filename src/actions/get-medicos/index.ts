"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { medicosTable } from "@/models/Schema";
import { protectedAction, ActionError } from "@/libs/safe-action";
import { searchMedicosSchema } from "@/actions/upsert-medico/schema"; // Reutiliza o schema de busca
import { buildAbility, Action as CaslAction } from "@/lib/ability";
import { eq, and, ilike, sql } from "drizzle-orm";


export const getMedicos = protectedAction
  .schema(searchMedicosSchema)
  .action(async ({ parsedInput, ctx: { orgId } }) => {
    const user = await currentUser();
    const role = user?.publicMetadata?.role as string;

    const ability = buildAbility(role, orgId);
    if (!ability.can(CaslAction.Read, "Medico")) {
      throw new ActionError("Você não tem permissão para ler dados de médicos.");
    }

    const { search, page, order, orderBy } = parsedInput;
    const limit = 10;
    const offset = (page && page > 0 ? page - 1 : 0) * limit;

    const whereOrg = eq(medicosTable.organizationId, orgId);

    const where = and(
      whereOrg,
      search ? ilike(medicosTable.nome, `%${search}%`) : undefined
    );

    const validOrderByColumns = ['id', 'nome', 'crm', 'createdAt', 'updatedAt']; // Adicione outras colunas válidas aqui
    const finalOrderBy = (orderBy && validOrderByColumns.includes(orderBy)) ? orderBy : 'id';

    const orderByColumn = medicosTable[finalOrderBy as keyof typeof medicosTable];

    try {
      const [medicos, [{ count } = { count: 0 }]] = await Promise.all([
        db
          .select()
          .from(medicosTable)
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
          .from(medicosTable)
          .where(where),
      ]);

      return {
        data: medicos,
        pagination: { page: page || 1, limit, total: count, totalPages: Math.ceil(count / limit) },
      };
    } catch (e) {
      console.error("Erro ao buscar médicos na Server Action:", e);
      throw new ActionError("Erro interno ao buscar médicos.");
    }
  });
