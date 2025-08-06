import { auth } from "@clerk/nextjs/server";
import { createSafeActionClient } from "next-safe-action";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { db } from "@/db";
import { organizationSchema } from "@/models/Schema";
import { eq } from "drizzle-orm";
import { z } from "zod"; // Importar Zod

export class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionError";
  }
}

const handleServerError = (e: Error) => {
  console.error("Erro capturado em handleServerError:", e);
  if (e instanceof ActionError) {
    return e.message;
  }
  return "Ocorreu um erro inesperado.";
};

// Crie um cliente base sem middleware
const baseActionClient = createSafeActionClient({
  handleServerError: handleServerError,
});

// protectedClient agora é uma função que retorna uma Server Action
export const actionClient = baseActionClient;

export const protectedClient = actionClient.use(async ({ next }) => {
  const { userId, orgId } = await auth();

  return next({ ctx: { userId, orgId } });
});