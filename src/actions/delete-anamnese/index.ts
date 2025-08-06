"use server";

import { db } from "@/db";
import { anamneseTable } from "@/models/Schema";
import { protectedClient, ActionError } from "@/libs/safe-action";
import { buildAbility, Action as CaslAction } from "@/lib/ability";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { deleteAnamneseSchema } from "./schema";

export const deleteAnamnese = protectedClient
  .schema(deleteAnamneseSchema)
  .action(async ({ parsedInput: { id }, ctx }) => {
    const { orgId } = ctx;

    // TODO: Implementar verificação de permissão CASL
    // const ability = buildAbility(role, orgId);
    // if (!ability.can(CaslAction.Delete, "Anamnese")) {
    //   throw new ActionError("Você não tem permissão para excluir anamneses.");
    // }

    try {
      const anamnese = await db.query.anamneseTable.findFirst({
        where: eq(anamneseTable.id, id),
      });

      if (!anamnese) {
        return { error: "Anamnese não encontrada." };
      }

      if (anamnese.organizationId !== orgId) {
        return { error: "Você não tem permissão para excluir esta anamnese." };
      }

      await db
        .delete(anamneseTable)
        .where(eq(anamneseTable.id, id));
      
      revalidatePath("/dashboard/anamnese");

      return { success: true, id };
    } catch (e) {
      console.error("Erro ao excluir anamnese na Server Action:", e);
      throw new ActionError("Erro interno ao excluir anamnese.");
    }
  });
