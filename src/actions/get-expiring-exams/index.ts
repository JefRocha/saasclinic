import { and, eq, gte, lte, isNull, or, like } from 'drizzle-orm';
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
  search: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export const getExpiringExams = protectedClient.schema(
  getExpiringExamsSchema,
).action(
  async ({ parsedInput, ctx: { orgId } }) => {
    const { search, startDate, endDate } = parsedInput;

    const start = startDate ?? dayjs().startOf('month').toDate();
    const end = endDate ?? dayjs().endOf('month').toDate();

    const whereConditions = [eq(anamneseTable.organizationId, orgId)];

    if (start && end) {
      whereConditions.push(gte(anamneseItemsTable.vencto, start));
      whereConditions.push(lte(anamneseItemsTable.vencto, end));
    }

    if (search) {
      whereConditions.push(
        or(
          like(colaboradorTable.name, `%${search}%`),
          like(clientsTable.fantasia, `%${search}%`),
        ),
      );
    }

    const expiringExams = await db
      .select({
        id: anamneseItemsTable.id,
        vencimento: anamneseItemsTable.vencto,
        dataRealizacao: anamneseTable.data, // Adicionado a data de realização
        colaboradorNome: colaboradorTable.name,
        clienteNome: clientsTable.fantasia,
        exameNome: examesTable.descricao,
        telefone: colaboradorTable.celular,
        clienteId: clientsTable.id,
        colaboradorId: colaboradorTable.id,
        organizationId: anamneseTable.organizationId, // Adicionado para depuração
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
      .leftJoin(
        employmentTable,
        and(
          eq(employmentTable.colaboradorId, colaboradorTable.id),
          eq(employmentTable.clientId, clientsTable.id),
          isNull(employmentTable.dataDemissao),
        ),
      )
      .where(and(...whereConditions))
      .orderBy(anamneseItemsTable.vencto);

    return { data: expiringExams };
  });