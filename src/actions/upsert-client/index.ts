import { and, eq, like, sql } from "drizzle-orm";
import { db } from "@/db";
import { clientsTable } from "@/models/Schema";
import { protectedAction } from "@/libs/safe-action";
import {
  upsertClientSchema,
  searchClientsSchema,
  SearchClientsResult,
} from "./schema";

export const upsertClient = protectedAction
  .schema(upsertClientSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { createdAt, updatedAt, ...dataToInsert } = parsedInput;

    await db
      .insert(clientsTable)
      .values({
        ...dataToInsert,
        vlrMens:
          parsedInput.vlrMens !== undefined && parsedInput.vlrMens !== null
            ? String(parsedInput.vlrMens)
            : parsedInput.vlrMens,
        organizationId: ctx.orgId,
      })
      .onConflictDoUpdate({
        target: [clientsTable.id],
        set: {
          ...dataToInsert,
          vlrMens:
            parsedInput.vlrMens !== undefined && parsedInput.vlrMens !== null
              ? String(parsedInput.vlrMens)
              : parsedInput.vlrMens,
        },
      });

    // REMOVIDO: revalidatePath("/clients")
    console.log("✅ upsertClient action completed");
  });

export const searchClients = protectedAction
  .schema(searchClientsSchema)
  .action(async ({ parsedInput, ctx }): Promise<SearchClientsResult> => {
    const { search = "", page = 1, limit = 10, orderBy, order } = parsedInput;
    const offset = (page - 1) * limit;

    const whereClause = and(
      ctx.orgId ? eq(clientsTable.organizationId, ctx.orgId) : undefined,
      search
        ? like(sql`lower(${clientsTable.fantasia})`, `%${search.toLowerCase()}%`)
        : undefined
    );

    const [data, [{ total }]] = await Promise.all([
      db
        .select()
        .from(clientsTable)
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(
          orderBy && order
            ? sql`${clientsTable[orderBy]} ${sql.raw(order)}`
            : clientsTable.fantasia
        ),
      db
        .select({ total: sql<number>`count(*)` })
        .from(clientsTable)
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

  await fetch("/api/clients/revalidate", {
  method: "POST",
  body: JSON.stringify({ path: "/dashboard/clients" }),
  headers: {
    "Content-Type": "application/json",
  },
});
