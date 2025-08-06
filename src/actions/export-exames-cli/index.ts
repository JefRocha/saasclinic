'use server';

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { examesCliTable, clientsTable, examesTable } from "@/models/Schema";
import { protectedClient, ActionError } from "@/libs/safe-action";
import { exportExamesCliSchema } from "./schema";
import { buildAbility, Action as CaslAction } from "@/lib/ability";
import { eq, and, ilike, sql } from "drizzle-orm";

export const exportExamesCli = protectedClient.schema(exportExamesCliSchema).action(
  async ({ clientId, search }, { orgId }) => {
    const user = await currentUser();
    const role = user?.publicMetadata?.role as string;

    const ability = buildAbility(role, orgId);
    if (!ability.can(CaslAction.Read, "ExameCli")) { // Assumindo a mesma permissão de leitura
      throw new ActionError("Você não tem permissão para exportar dados de exames por cliente.");
    }

    // 1. Buscar IDs de clientes da organização
    const orgClients = await db
      .select({ id: clientsTable.id })
      .from(clientsTable)
      .where(eq(clientsTable.organizationId, orgId));

    const orgClientIds = orgClients.map(client => client.id);

    // 2. Construir a condição WHERE
    const whereConditions = [
      sql`${examesCliTable.idcliente} IN ${orgClientIds}`, // Filtra por clientes da organização
    ];

    if (clientId) {
      whereConditions.push(eq(examesCliTable.idcliente, Number(clientId)));
    }

    if (search) {
      whereConditions.push(ilike(examesCliTable.descricao, `%${search}%`));
    }

    const where = and(...whereConditions);

    try {
      const examesCli = await db
        .select({
          id: examesCliTable.id,
          idcliente: examesCliTable.idcliente,
          idexame: examesCliTable.idexame,
          descricao: examesCliTable.descricao,
          valor: examesCliTable.valor,
          cargo: examesCliTable.cargo,
          codExameAnt: examesCliTable.codExameAnt,
          clienteNome: clientsTable.razaoSocial, // Adiciona o nome do cliente
          exameDescricao: examesTable.descricao, // Adiciona a descrição do exame
        })
        .from(examesCliTable)
        .leftJoin(clientsTable, eq(examesCliTable.idcliente, clientsTable.id))
        .leftJoin(examesTable, eq(examesCliTable.idexame, examesTable.id))
        .where(where)
        .orderBy(examesCliTable.id); // Ordenação padrão para exportação

      return examesCli;
    } catch (e) {
      console.error("Erro ao exportar exames por cliente na Server Action:", e);
      throw new ActionError("Erro interno ao exportar exames por cliente.");
    }
  });