"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { deleteClientSchema } from "./schema";

import { db } from "@/db";
import { clientsTable } from "@/models/Schema";
type Client = typeof clientsTable.$inferSelect;

import { protectedClient } from "@/libs/safe-action";

export const deleteClient = protectedClient.schema(deleteClientSchema).action(
  async (parsedInput, { orgId }) => {
    const client: Client | undefined = await db.query.clientsTable.findFirst({
      where: eq(clientsTable.id, parsedInput.id),
    });
    if (!client) {
      return { error: "Cliente não encontrado." };
    }
    if (client.organizationId !== orgId) {
      return { error: "Você não tem permissão para excluir este cliente." };
    }
    await db.delete(clientsTable).where(eq(clientsTable.id, parsedInput.id));
    revalidatePath("/clients");
    revalidatePath("/api/clients");
    return { data: { success: true } };
  });
