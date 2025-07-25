"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { deleteExameSchema } from "./schema";

import { db } from "@/db";
import { examesTable, Exame } from "@/models/Schema";

import { protectedAction } from "@/libs/safe-action";

export const deleteExame = async (input: typeof deleteExameSchema._type) => {
  return protectedAction.schema(deleteExameSchema)
    .action(async ({ parsedInput, ctx }) => {
      const exame: Exame | undefined = await db.query.examesTable.findFirst({
        where: eq(examesTable.id, parsedInput.id),
      });
      if (!exame) {
        return { error: "Exame não encontrado." };
      }
      if (exame.organizationId !== ctx.orgId) {
        return { error: "Você não tem permissão para excluir este exame." };
      }
      await db.delete(examesTable).where(eq(examesTable.id, parsedInput.id));
      revalidatePath("/dashboard/exames");
      revalidatePath("/api/exames");
      return { data: { success: true } };
    })(input);
};