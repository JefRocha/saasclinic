// src/libs/safe-action.ts
import { auth } from "@clerk/nextjs/server";
import { createSafeActionClient } from "next-safe-action";
import { ensureOrganizationExistsInDb } from "./organization-utils";

export class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionError";
  }
}

const handleServerError = (e: unknown) => {
  console.error("Erro capturado em handleServerError:", e);
  return e instanceof Error ? e.message : "Ocorreu um erro inesperado.";
};

export const actionClient = createSafeActionClient({ handleServerError });

// ✅ use() aceita callback assíncrona; aqui usamos await auth()
export const protectedClient = actionClient.use(async ({ next }) => {
  const { userId, orgId } = await auth(); // <- necessário no seu setup

  if (!userId) {
    throw new ActionError("Não autenticado.");
  }

  // Garante que a organização existe no banco de dados local
  if (orgId) {
    await ensureOrganizationExistsInDb(orgId);
  }

  return next({ ctx: { userId, orgId } });
});
