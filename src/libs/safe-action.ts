import { auth } from "@clerk/nextjs/server";

import { createSafeActionClient } from "next-safe-action";

export class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionError";
  }
}

const handleReturnedServerError = (e: Error) => {
  console.error("Erro bruto no handleReturnedServerError:", e);
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
  getAuthData: async () => {
    const { userId, orgId } = auth();
    if (!userId || !orgId) {
      throw new ActionError("Acesso não autorizado.");
    }
    return { userId, orgId };
  },
});