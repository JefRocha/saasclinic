"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { examesTable } from "@/db/schema";
import { action } from "@/lib/next-safe-action";

import { deleteExamSchema } from "./schema";

export const deleteExam = action
  .schema(deleteExamSchema)
  .action(async ({ parsedInput: { id } }) => {
    try {
      const deletedExam = await db
        .delete(examesTable)
        .where(eq(examesTable.id, id))
        .returning();

      if (!deletedExam) {
        return {
          error: "Exame não encontrado.",
        };
      }

      revalidatePath("/exams");

      return {
        success: "Exame deletado com sucesso.",
      };
    } catch (error) {
      return {
        error: "Ocorreu um erro ao deletar o exame.",
      };
    }
  });
