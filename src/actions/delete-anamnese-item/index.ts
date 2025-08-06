"use server";

import { db } from "@/db";
import { anamneseItemsTable } from "@/models/Schema";
import { protectedClient, ActionError } from "@/libs/safe-action";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { deleteAnamneseItemSchema } from "./schema";

export const deleteAnamneseItem = protectedClient
  .schema(deleteAnamneseItemSchema)
  .action(async ({ parsedInput: { anamneseId, itemId }, ctx }) => {
    const { orgId } = ctx;

    try {
      const deletedItems = await db
        .delete(anamneseItemsTable)
        .where(and(
          eq(anamneseItemsTable.anamneseId, anamneseId),
          eq(anamneseItemsTable.id, itemId)
        ))
        .returning({ id: anamneseItemsTable.id });

      if (deletedItems.length === 0) {
        throw new ActionError("Item da anamnese não encontrado ou você não tem permissão para excluí-lo.");
      }

      revalidatePath("/dashboard/anamnese");
      revalidatePath(`/dashboard/anamnese/${anamneseId}`);

      return { success: true, id: deletedItems[0].id };
    } catch (e) {
      console.error("Erro ao excluir item da anamnese na Server Action:", e);
      throw new ActionError("Erro interno ao excluir item da anamnese.");
    }
  });
