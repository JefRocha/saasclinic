"use server";


import { eq, count } from "drizzle-orm";

import { db } from "@/db";
import { clientsTable } from "@/models/Schema";
import { z } from "zod";
import { protectedClient } from "@/libs/safe-action";

export const getDashboardData = protectedClient.schema(z.void()).action(
  async ({ orgId }) => {
    const totalClients = await db.select({ count: count() }).from(clientsTable).where(eq(clientsTable.organizationId, orgId));

    // TODO: Adicionar contagem de agendamentos e outras estatísticas

    return {
      totalClients: totalClients[0]?.count ?? 0,
    };
  });