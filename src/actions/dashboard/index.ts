"use server";


import { eq, count } from "drizzle-orm";

import { db } from "@/db";
import { clientsTable } from "@/models/Schema";
import { protectedAction } from "@/libs/safe-action";

export const getDashboardData = async () => {
  return protectedAction.action(async ({ ctx }) => {
    const totalClients = await db.select({ count: count() }).from(clientsTable).where(eq(clientsTable.organizationId, ctx.orgId));

    // TODO: Adicionar contagem de agendamentos e outras estatísticas

    return {
      totalClients: totalClients[0]?.count ?? 0,
    };
  })();
};