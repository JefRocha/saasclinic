"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { examesTable } from "@/models/Schema";
import { protectedClient, ActionError } from "@/libs/safe-action";
import { deleteExameSchema } from "./schema";
import { buildAbility, Action as CaslAction } from "@/lib/ability";
import { eq } from "drizzle-orm";


export const deleteExame = protectedClient.schema(deleteExameSchema).action(
  async (parsedInput, { orgId }) => {
    const user = await currentUser();
    const role = user?.publicMetadata?.role as string;

    const ability = buildAbility(role, orgId);
    if (!ability.can(CaslAction.Delete, "Exame")) {
      throw new ActionError("Você não tem permissão para excluir exames.");
    }

    const { id } = parsedInput;

    const exame = await db.query.examesTable.findFirst({
      where: eq(examesTable.id, id),
    });

    if (!exame) {
      throw new ActionError("Exame não encontrado.");
    }

    // super_admin pode deletar qualquer exame; demais verificam orgId
    if (role !== "super_admin" && exame.organizationId !== orgId) {
      throw new ActionError("Você não tem permissão para excluir este exame.");
    }

    try {
      await db.delete(examesTable).where(eq(examesTable.id, id));
      return { success: true, id };
    } catch (e) {
      console.error("Erro ao excluir exame na Server Action:", e);
      throw new ActionError("Erro interno ao excluir exame.");
    }
  });
