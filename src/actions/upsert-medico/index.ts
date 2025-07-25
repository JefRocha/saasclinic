"use server";

import { and, eq, like, sql } from "drizzle-orm";
import { db } from "@/db";
import { medicosTable } from "@/models/Schema";
import { protectedAction } from "@/libs/safe-action";
import {
  upsertMedicoSchema,
  searchMedicosSchema,
  SearchMedicosResult,
} from "./schema";
import { revalidatePath } from "next/cache";

export const upsertMedico = protectedAction
  .schema(upsertMedicoSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { createdAt, updatedAt, ...dataToInsert } = parsedInput;

    const [upsertedMedico] = await db
      .insert(medicosTable)
      .values({
        ...dataToInsert,
        organizationId: ctx.orgId,
        usaAgenda: dataToInsert.usaAgenda ? 1 : 0, // Converte boolean para 0/1
      })
      .onConflictDoUpdate({
        target: [medicosTable.id],
        set: {
          ...dataToInsert,
          usaAgenda: dataToInsert.usaAgenda ? 1 : 0, // Converte boolean para 0/1
        },
      })
      .returning({ id: medicosTable.id });

    revalidatePath("/dashboard/medicos");
    return { id: upsertedMedico.id };
  });

export const searchMedicos = protectedAction
  .schema(searchMedicosSchema)
  .action(async ({ parsedInput, ctx }): Promise<SearchMedicosResult> => {
    const { search = "", page = 1, limit = 10, orderBy, order } = parsedInput;
    const offset = (page - 1) * limit;

    const whereClause = and(
      ctx.orgId ? eq(medicosTable.organizationId, ctx.orgId) : undefined,
      search
        ? like(sql`lower(${medicosTable.nome})`, `%${search.toLowerCase()}%`)
        : undefined
    );

    const [data, [{ total }]] = await Promise.all([
      db
        .select()
        .from(medicosTable)
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(
          orderBy && order
            ? sql`${medicosTable[orderBy]} ${sql.raw(order)}`
            : medicosTable.nome
        ),
      db
        .select({ total: sql<number>`count(*)` })
        .from(medicosTable)
        .where(whereClause),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  });