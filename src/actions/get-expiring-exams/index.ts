'use server';

import { and, eq, gte, lte, isNull } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { protectedClient } from '@/libs/safe-action';
import { z } from 'zod';
import { getExpiringExamsResponseSchema } from './schema';
import {
  anamneseItemsTable,
  anamneseTable,
  colaboradorTable,
  clientsTable,
  examesTable,
  employmentTable,
} from '@/models/Schema';
import dayjs from 'dayjs';

const getExpiringExamsSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export const getExpiringExams = protectedClient.schema(
  getExpiringExamsSchema,
).action(
  async (parsedInput, { orgId }) => {
    const { startDate, endDate } = parsedInput;

    const start = startDate ?? dayjs().startOf('month').toDate();
    const end = endDate ?? dayjs().endOf('month').toDate();

    const expiringExams = await db
      .select({
        id: anamneseItemsTable.id,
        vencimento: anamneseItemsTable.vencto,
        colaboradorNome: colaboradorTable.name,
        clienteNome: clientsTable.fantasia,
        exameNome: examesTable.descricao,
        telefone: colaboradorTable.celular,
        clienteId: clientsTable.id,
        colaboradorId: colaboradorTable.id,
      })
      .from(anamneseItemsTable)
      .innerJoin(
        anamneseTable,
        eq(anamneseItemsTable.anamneseId, anamneseTable.id),
      )
      .innerJoin(
        colaboradorTable,
        eq(anamneseTable.colaboradorId, colaboradorTable.id),
      )
      .innerJoin(clientsTable, eq(anamneseTable.clienteId, clientsTable.id))
      .innerJoin(examesTable, eq(anamneseItemsTable.exameId, examesTable.id))
      .innerJoin(
        employmentTable,
        and(
          eq(employmentTable.colaboradorId, colaboradorTable.id),
          eq(employmentTable.clientId, clientsTable.id),
          isNull(employmentTable.dataDemissao),
        ),
      )
      .where(
        and(
          eq(anamneseTable.organizationId, orgId),
          gte(anamneseItemsTable.vencto, start),
          lte(anamneseItemsTable.vencto, end),
        ),
      )
      .orderBy(anamneseItemsTable.vencto);

    return { data: expiringExams };
  });
