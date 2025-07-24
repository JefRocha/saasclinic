import { auth } from "@clerk/nextjs/server";

import { createSafeActionClient } from "next-safe-action";

export class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionError";
  }
}

const handleReturnedServerError = (e: Error) => {
  console.error("Erro capturado em handleReturnedServerError:", e);
  if (e instanceof ActionError) {
    return e.message;
  }
  return "Ocorreu um erro inesperado.";
};

export const action = createSafeActionClient({
  handleReturnedServerError: handleReturnedServerError,
});

export const protectedAction = createSafeActionClient({
  handleReturnedServerError: handleReturnedServerError,
}).use(async ({ next }) => {
  const { userId, orgId } = await auth();
  console.log("protectedAction - userId:", userId, "orgId:", orgId);

  if (!userId) {
    throw new ActionError("Usuário não autenticado.");
  }
  // Adicionar verificação explícita para orgId
  if (!orgId) {
    throw new ActionError("Organização não encontrada para o usuário.");
  }

  return next({
    ctx: {
      userId,
      orgId,
    },
  });
});
