"use server";

import { z } from "zod";
import { and, asc, count, desc, eq, ilike } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { Client, clientsTable } from "@/models/Schema";
import { protectedAction } from "@/libs/safe-action";

import { searchClientsSchema, SearchClientsResult, upsertClientSchema } from "./schema";

export const upsertClient = protectedAction
  .schema(upsertClientSchema)
  .action(async ({ parsedInput, ctx }) => {
    console.log("Iniciando upsertClient com input:", parsedInput);

    const { createdAt, updatedAt, ...dataToInsert } = parsedInput;

    try {
      await db
        .insert(clientsTable)
        .values({
          ...dataToInsert,
          organizationId: ctx.orgId,
        })
        .onConflictDoUpdate({
          target: [clientsTable.id],
          set: {
            ...dataToInsert,
            updatedAt: new Date(),
          },
        });

      console.log(
        "Operação de upsert no banco de dados concluída com sucesso.",
      );
      revalidatePath("/dashboard/clients");

      return { success: true };
    } catch (error) {
      console.error("Erro detalhado do banco de dados:", error);
      return { error: "Não foi possível salvar o cliente." };
    }
  });

export const getClinicClients = protectedAction
  .action(async ({ ctx }): Promise<Client[]> => {
    return await db.query.clientsTable.findMany({
      where: eq(clientsTable.organizationId, ctx.orgId),
      orderBy: desc(clientsTable.createdAt),
    });
  });

export const getClientById = protectedAction
  .schema(z.string())
  .action(async ({ parsedInput: id, ctx }): Promise<Client | { error: string }> => {
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
  });

export const searchClients = protectedAction
  .schema(searchClientsSchema)
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
  });