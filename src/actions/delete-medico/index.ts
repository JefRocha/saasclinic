"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { deleteMedicoSchema } from "./schema";

import { db } from "@/db";
import { medicosTable } from "@/models/Schema";

import { protectedAction } from "@/libs/safe-action";

export const deleteMedico = async (input: typeof deleteMedicoSchema._type) => {
  return protectedAction.schema(deleteMedicoSchema)
    .action(async ({ parsedInput, ctx }) => {
      const medico = await db.query.medicosTable.findFirst({
        where: eq(medicosTable.id, parsedInput.id),
      });
      if (!medico) {
        return { error: "Médico não encontrado." };
      }
      if (medico.organizationId !== ctx.orgId) {
        return { error: "Você não tem permissão para excluir este médico." };
      }
      await db.delete(medicosTable).where(eq(medicosTable.id, parsedInput.id));
      revalidatePath("/dashboard/medicos");
      revalidatePath("/api/medicos");
      return { data: { success: true } };
    })(input);
};