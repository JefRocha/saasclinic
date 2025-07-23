"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { deleteClientSchema } from "./schema";

import { db } from "@/db";
import { clientsTable, Client } from "@/models/Schema";

import { protectedAction } from "@/libs/safe-action";

export const deleteClient = async (input: typeof deleteClientSchema._type) => {
  return protectedAction.schema(deleteClientSchema)
    .action(async ({ parsedInput, ctx }) => {
      const client: Client | undefined = await db.query.clientsTable.findFirst({
        where: eq(clientsTable.id, parsedInput.id),
      });
      if (!client) {
        return { error: "Cliente não encontrado." };
      }
      if (client.organizationId !== ctx.orgId) {
        return { error: "Você não tem permissão para excluir este cliente." };
      }
      await db.delete(clientsTable).where(eq(clientsTable.id, parsedInput.id));
      revalidatePath("/clients");
      revalidatePath("/api/clients");
      return { data: { success: true } };
    })(input);
};
