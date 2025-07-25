"use server";

import { and, eq, like, sql } from "drizzle-orm";
import { db } from "@/db";
import { examesTable } from "@/models/Schema";
import { protectedAction } from "@/libs/safe-action";
import {
  upsertExameSchema,
  searchExamesSchema,
  SearchExamesResult,
} from "./schema";
import { revalidatePath } from "next/cache";

export const upsertExame = protectedAction
  .schema(upsertExameSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { createdAt, updatedAt, ...dataToInsert } = parsedInput;

    const [upsertedExame] = await db
      .insert(examesTable)
      .values({
        ...dataToInsert,
        organizationId: ctx.orgId,
      })
      .onConflictDoUpdate({
        target: [examesTable.id],
        set: {
          ...dataToInsert,
        },
      })
      .returning({ id: examesTable.id });

    revalidatePath("/dashboard/exames");
    return { id: upsertedExame.id };
  });

export const searchExames = protectedAction
  .schema(searchExamesSchema)
  .action(async ({ parsedInput, ctx }): Promise<SearchExamesResult> => {
    const { search = "", page = 1, limit = 10, orderBy, order } = parsedInput;
    const offset = (page - 1) * limit;

    const whereClause = and(
      ctx.orgId ? eq(examesTable.organizationId, ctx.orgId) : undefined,
      search
        ? like(sql`lower(${examesTable.descricao})`, `%${search.toLowerCase()}%`)
        : undefined
    );

    const [data, [{ total }]] = await Promise.all([
      db
        .select()
        .from(examesTable)
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(
          orderBy && order
            ? sql`${examesTable[orderBy]} ${sql.raw(order)}`
            : examesTable.descricao
        ),
      db
        .select({ total: sql<number>`count(*)` })
        .from(examesTable)
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