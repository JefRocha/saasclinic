"use server";

import { and, asc, count, desc, eq, ilike } from "drizzle-orm";
import { revalidatePath } from "next/cache";



import { db } from "@/db";
import { clientsTable, Client } from "@/models/Schema";

import { protectedAction } from "@/libs/safe-action";

import { upsertClientSchema, searchClientsSchema, SearchClientsResult } from "./schema";

export const upsertClient = async (input: typeof upsertClientSchema._type) => {
  return protectedAction.schema(upsertClientSchema).action(async ({ parsedInput, ctx }) => {
    const { createdAt, updatedAt, ...dataToInsert } = parsedInput;

    await db
          .insert(clientsTable)
          .values({
            ...dataToInsert,
            vlrMens: parsedInput.vlrMens !== undefined && parsedInput.vlrMens !== null ? String(parsedInput.vlrMens) : parsedInput.vlrMens,
            organizationId: ctx.orgId,
          })
          .onConflictDoUpdate({
            target: [clientsTable.id],
            set: {
              ...dataToInsert,
              vlrMens: parsedInput.vlrMens !== undefined && parsedInput.vlrMens !== null ? String(parsedInput.vlrMens) : parsedInput.vlrMens,
            },
          });
    revalidatePath("/clients");
    console.log("upsertClient action completed successfully");
  })(input);
};

export const getClinicClients = async () => {
  return protectedAction.action(async ({ ctx }): Promise<Client[]> => {
    return await db.query.clientsTable.findMany({
      where: eq(clientsTable.organizationId, ctx.orgId),
      orderBy: desc(clientsTable.createdAt),
    });
  })();
};

export const getClientById = async (clientId: string) => {
  return protectedAction.action(async ({ parsedInput: id, ctx }): Promise<Client | { error: string }> => {
    const client = await db.query.clientsTable.findFirst({
      where: and(
        eq(clientsTable.id, Number(id)),
        eq(clientsTable.organizationId, ctx.orgId),
      ),
    });

    if (!client) {
      return { error: "Client not found" };
    }

    return client;
  })(clientId);
};

export const searchClients = async (params: typeof searchClientsSchema._type) => {
  return protectedAction.schema(searchClientsSchema)
    .action(async ({ parsedInput, ctx }): Promise<SearchClientsResult> => {
      const { search = "", page = 1, limit = 10, orderBy, order } = parsedInput;

      const conditions = [eq(clientsTable.organizationId, ctx.orgId)];

      if (search) {
        conditions.push(ilike(clientsTable.fantasia, `%${search}%`));
      }

      const clients = await db.query.clientsTable.findMany({
        where: and(...conditions),
        limit,
        offset: (page - 1) * limit,
        orderBy: orderBy
          ? order === "asc"
            ? asc(clientsTable[orderBy as keyof typeof clientsTable.$inferSelect])
            : desc(clientsTable[orderBy as keyof typeof clientsTable.$inferSelect])
          : desc(clientsTable.createdAt),
      });

      const result = await db
        .select({ count: count() })
        .from(clientsTable)
        .where(and(...conditions));
      const totalCount = result[0]?.count ?? 0;

      return {
        data: clients,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      };
    })(params);
};
