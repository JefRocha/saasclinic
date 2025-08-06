'use server';

import { currentUser } from "@clerk/nextjs/server";
// import { db } from "@/db";
// import { contasAPagarTable } from "@/models/Schema"; // Certifique-se de que esta importação está correta
import { protectedClient, ActionError } from "@/libs/safe-action";
import { getContasAPagarDashboardDataSchema, GetContasAPagarDashboardDataResult } from "./schema";
import { buildAbility, Action as CaslAction } from "@/lib/ability";
// import { eq, and, gte, lte, sql } from "drizzle-orm";
// import dayjs from 'dayjs';

export const getContasAPagarDashboardData = protectedClient.schema(
  getContasAPagarDashboardDataSchema,
).action(
  async ({ ctx: { orgId } }) => {
    const user = await currentUser();
    const role = user?.publicMetadata?.role as string;

    const ability = buildAbility(role, orgId);
    if (!ability.can(CaslAction.Read, "ContasAPagar")) { // Assumindo uma permissão para ContasAPagar
      throw new ActionError("Você não tem permissão para ler dados de contas a pagar.");
    }

    // const { startDate, endDate } = parsedInput;

    let totalAPagar = 0;
    let vencidas = 0;
    let aVencer30Dias = 0;
    let aVencer60Dias = 0;
    let aVencer90Dias = 0;

    // Lógica para buscar dados reais do banco de dados virá aqui
    // Por enquanto, dados fictícios para integração com o frontend
    totalAPagar = 15500;
    vencidas = 2100;
    aVencer30Dias = 5000;
    aVencer60Dias = 4000;
    aVencer90Dias = 3000;

    return {
      totalAPagar,
      vencidas,
      aVencer30Dias,
      aVencer60Dias,
      aVencer90Dias,
    } as GetContasAPagarDashboardDataResult;
  });