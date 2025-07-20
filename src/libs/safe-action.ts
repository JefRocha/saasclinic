

import { auth } from "@clerk/nextjs/server";
import { createSafeActionClient } from "next-safe-action";

import { ActionError } from "./action-error";

const handleReturnedServerError = (e: Error) => {
  if (e instanceof ActionError) {
    return e.message;
  }
  return "Ocorreu um erro inesperado.";
};

export const action = createSafeActionClient({
  handleReturnedServerError: handleReturnedServerError,
});

export const protectedAction = action.use(async ({ next }) => {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new ActionError("Acesso não autorizado.");
  }

  return next({
    ctx: {
      userId,
      orgId,
    },
  });
});