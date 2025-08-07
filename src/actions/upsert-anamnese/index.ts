'use server';

/* ------------------------------------------------------------------
 * upsertAnamnese.ts – versão consolidada e sem duplicações
 * ------------------------------------------------------------------ */

import { and, eq, notInArray, not, isNull, sql } from 'drizzle-orm';
import { db } from "@/db";
import { revalidatePath } from 'next/cache';
import ptBRMessages from '@/locales/pt-BR.json';

import {
  anamneseTable,
  anamneseItemsTable,
  employmentTable,
  examesTable as ex,
  examesCliTable,
} from '@/models/Schema';
import { ActionError } from '@/libs/action-error';
import { protectedClient } from '@/libs/safe-action';
import { z } from 'zod';

import { upsertAnamneseSchema } from './schema';

import { addMonths } from '@/helpers/date-utils';

const buildSuccess = <T,>(data: T) => ({ success: true, data });

/* ================================================================
 * ACTION 1 → upsertAnamnese
 * ============================================================== */
export const upsertAnamnese = protectedClient
  .schema(upsertAnamneseSchema)
  .action(async (args) => {
    const { parsedInput, ctx: { orgId, userId } } = args;
    const t = (k: string) => k.split('.').reduce((a: any, p) => a?.[p] ?? k, ptBRMessages);
    if (!orgId || !userId) throw new ActionError(t('Errors.unauthorized'));

    // extrai e normaliza
    const { id: anamneseId, items, ...anamneseData } = parsedInput;

    // Calcula o valor total dos exames
    const totalExamsValue = items.reduce((sum, item) => sum + (item.valor || 0), 0);

    try {
      const result = await db.transaction(async (tx) => {
        /* ------------ ficha mestre ------------- */
        const savedRows = anamneseId
          ? await tx
              .update(anamneseTable)
              .set({ ...anamneseData, total: totalExamsValue, updatedAt: new Date() })
              .where(and(eq(anamneseTable.id, anamneseId), eq(anamneseTable.organizationId, orgId)))
              .returning()
          : await tx
              .insert(anamneseTable)
              .values({ ...anamneseData, total: totalExamsValue, organizationId: orgId, atendenteId: userId })
              .returning();

        const anamnese = savedRows[0];
        if (!anamnese) throw new ActionError(t('Errors.database_error'));

        /* -------- vínculo colaborador × cliente -------- */
        if (anamnese.colaboradorId && anamnese.clienteId) {
          const admDate = anamnese.data ? new Date(anamnese.data as Date) : new Date();
          const dataAdmissao = admDate.toISOString().slice(0, 10);

          await tx
            .insert(employmentTable)
            .values({
              colaboradorId: anamnese.colaboradorId,
              clientId: anamnese.clienteId,
              dataAdmissao,
            } as typeof employmentTable.$inferInsert)
            .onConflictDoNothing();

          await tx
            .update(employmentTable)
            .set({ dataDemissao: null, updatedAt: new Date() })
            .where(
              and(
                eq(employmentTable.colaboradorId, anamnese.colaboradorId),
                eq(employmentTable.clientId, anamnese.clienteId),
                not(isNull(employmentTable.dataDemissao)),
              ),
            );
        }

        /* ------------- itens ------------- */
        const keepIds = items.flatMap((i) => (i.id ? [i.id] : []));
        if (anamneseId && keepIds.length) {
          await tx
            .delete(anamneseItemsTable)
            .where(
              and(
                eq(anamneseItemsTable.anamneseId, anamnese.id),
                notInArray(anamneseItemsTable.id, keepIds),
              ),
            );
        }

        const examValueUpdatesNeeded: { clientId: number; exameId: number; currentClientExamValue: number; newAnamneseItemValue: number; }[] = [];

        for (const item of items) {
          // Busca validade/validade1
          const [v] = await tx
            .select({ v0: ex.validade, v1: ex.validade1 })
            .from(ex)
            .where(eq(ex.id, item.exameId))
            .limit(1);
          if (!v) throw new ActionError(t('Errors.exam_not_found'));

          // Lógica para examesCliTable
          if (anamnese.clienteId && item.exameId && item.valor !== undefined && item.valor !== null) {
            const existingClientExam = await tx
              .select()
              .from(examesCliTable)
              .where(and(
                eq(examesCliTable.idcliente, anamnese.clienteId),
                eq(examesCliTable.idexame, item.exameId)
              ))
              .limit(1);

            const newAnamneseItemValue = Number(item.valor);

            if (existingClientExam.length > 0) {
              const currentClientExamValue = Number(existingClientExam[0].valor);
              if (currentClientExamValue !== newAnamneseItemValue) {
                examValueUpdatesNeeded.push({
                  clientId: anamnese.clienteId,
                  exameId: item.exameId,
                  currentClientExamValue: currentClientExamValue,
                  newAnamneseItemValue: newAnamneseItemValue,
                });
              }
            } else {
              // Se não existe, insere um novo registro na examesCliTable
              await tx.insert(examesCliTable).values({
                idcliente: anamnese.clienteId,
                idexame: item.exameId,
                valor: newAnamneseItemValue,
                descricao: item.descricao, // Assumindo que a descrição pode vir do item da anamnese
                cargo: item.cargo, // Assumindo que o cargo pode vir do item da anamnese
                codExameAnt: item.codExameAnt, // Assumindo que o codExameAnt pode vir do item da anamnese
              });
            }
          }

          // Conta exames anteriores
          const cntRows = await tx
            .select({ cnt: sql<number>`count(*)`.as('cnt') })
            .from(anamneseItemsTable)
            .innerJoin(anamneseTable, eq(anamneseTable.id, anamneseItemsTable.anamneseId))
            .where(
              and(
                eq(anamneseItemsTable.exameId, item.exameId),
                eq(anamneseTable.colaboradorId, anamnese.colaboradorId),
                eq(anamneseTable.clienteId, anamnese.clienteId),
              ),
            );
          const prevCount = cntRows[0]?.cnt ?? 0;

          const months = prevCount === 0 ? v.v0 : v.v1;
          const baseDate = anamnese.data ? new Date(anamnese.data as Date) : new Date();
          const vencto = addMonths(baseDate, months).toISOString().slice(0, 10);

          const payload = {
            ...item,
            vencto,
            valor: item.valor != null ? String(item.valor) : undefined,
          } as typeof anamneseItemsTable.$inferInsert;

          if (item.id) {
            await tx.update(anamneseItemsTable).set(payload).where(eq(anamneseItemsTable.id, item.id));
          } else {
            await tx.insert(anamneseItemsTable).values({ ...payload, anamneseId: anamnese.id });
          }
        }

        return buildSuccess({ anamnese, examValueUpdatesNeeded });
      });

      revalidatePath('/dashboard/anamnese');
      return result;
    } catch (e) {
      console.error('upsertAnamnese', e);
      throw new ActionError('Erro BD');
    }
  });
