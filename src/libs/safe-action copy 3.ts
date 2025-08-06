import { auth, currentUser } from "@clerk/nextjs/server";
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

export type Role = "admin" | "manager" | "user";
function buildAbility(role: Role) {
  return {
    can(action: "create" | "update" | "delete" | "read", _subject: string) {
      if (role === "admin") return true;
      if (role === "manager") return action !== "delete";
      return action === "read";
    },
  };
}

export const protectedClient  = actionClient.use(async ({ next }) => {
  const { userId, orgId } = auth();
  if (!userId) throw new ActionError("Não autenticado.");
  if (orgId) await ensureOrganizationExistsInDb(orgId);

  const user = await currentUser();
  const role = (user?.publicMetadata?.role as Role | undefined) ?? "user";
  const ability = buildAbility(role);

  return next({ ctx: { userId, orgId, role, ability } });
});

export function requirePermission(
  ability: ReturnType<typeof buildAbility>,
  action: "create" | "update" | "delete" | "read",
  subject: string
) {
  if (!ability.can(action, subject)) {
    throw new ActionError("Permissão negada.");
  }
}
