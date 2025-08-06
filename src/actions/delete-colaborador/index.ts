'use server';

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { deleteColaboradorSchema } from "./schema";

import { db } from "@/db";
import { colaboradorTable } from "@/models/Schema";

import { protectedClient, ActionError } from "@/libs/safe-action";
import { buildAbility, Action as CaslAction } from "@/lib/ability";
import { currentUser } from "@clerk/nextjs/server";

export const deleteColaborador = protectedClient.schema(deleteColaboradorSchema).action(
  async (parsedInput, { orgId }) => {
    const user = await currentUser();
    const role = user?.publicMetadata?.role as string;

    const ability = buildAbility(role, orgId);
    if (!ability.can(CaslAction.Delete, "Colaborador")) {
      throw new ActionError("Você não tem permissão para excluir colaboradores.");
    }

    const colaborador = await db.query.colaboradorTable.findFirst({
      where: eq(colaboradorTable.id, Number(parsedInput.id)),
    });

    if (!colaborador) {
      throw new ActionError("Colaborador não encontrado.");
    }

    if (colaborador.organizationId !== orgId) {
      throw new ActionError("Você não tem permissão para excluir este colaborador.");
    }

    await db.delete(colaboradorTable).where(eq(colaboradorTable.id, Number(parsedInput.id)));
    
    // Revalidar paths relevantes
    revalidatePath("/dashboard/colaboradores");
    // revalidatePath("/api/colaboradores"); // Se houver uma API Route para colaboradores

    return { data: { success: true } };
  });
