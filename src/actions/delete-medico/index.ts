"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { medicosTable } from "@/models/Schema";
import { protectedClient, ActionError } from "@/libs/safe-action";
import { deleteMedicoSchema } from "./schema";
import { buildAbility, Action as CaslAction } from "@/lib/ability";
import { eq } from "drizzle-orm";


export const deleteMedico = protectedClient.schema(deleteMedicoSchema).action(
  async (parsedInput, { orgId }) => {
    const user = await currentUser();
    const role = user?.publicMetadata?.role as string;

    const ability = buildAbility(role, orgId);
    if (!ability.can(CaslAction.Delete, "Medico")) {
      throw new ActionError("Você não tem permissão para excluir médicos.");
    }

    const { id } = parsedInput;

    const medico = await db.query.medicosTable.findFirst({
      where: eq(medicosTable.id, id),
    });

    if (!medico) {
      throw new ActionError("Médico não encontrado.");
    }

    // super_admin pode deletar qualquer médico; demais verificam orgId
    if (role !== "super_admin" && medico.organizationId !== orgId) {
      throw new ActionError("Você não tem permissão para excluir este médico.");
    }

    try {
      await db.delete(medicosTable).where(eq(medicosTable.id, id));
      return { success: true, id };
    } catch (e) {
      console.error("Erro ao excluir médico na Server Action:", e);
      throw new ActionError("Erro interno ao excluir médico.");
    }
  });
