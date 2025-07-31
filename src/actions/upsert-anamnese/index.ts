'use server';

/* ------------------------------------------------------------------
 * upsertAnamnese.ts – versão consolidada e sem duplicações
 * ------------------------------------------------------------------ */

import { and, eq, notInArray, not, isNull, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import ptBRMessages from '@/locales/pt-BR.json';

import {
  anamneseTable,
  anamneseItemsTable,
  employmentTable,
  examesTable as ex,
} from '@/models/Schema';
import { db } from '@/libs/DB';
import { ActionError } from '@/libs/action-error';
import { protectedAction } from '@/libs/safe-action';
import { z } from 'zod';

import { upsertAnamneseSchema } from './schema';

const buildSuccess = <T,>(data: T) => ({ success: true, data });

/** Soma meses sem libs externas */
const addMonths = (d: Date, m: number) => {
  const x = new Date(d);
  x.setMonth(x.getMonth() + m);
  return x;
};

/* ================================================================
 * ACTION 1 → upsertAnamnese
 * ============================================================== */
export const upsertAnamnese = protectedAction
  .schema(upsertAnamneseSchema)
  .action(async ({ parsedInput, ctx: { orgId } }) => {
    const t = (k: string) => k.split('.').reduce((a: any, p) => a?.[p] ?? k, ptBRMessages);
    if (!orgId) throw new ActionError(t('Errors.unauthorized'));

    // extrai e normaliza
    const { id: anamneseId, items, atendenteId, ...raw } = parsedInput;
    const atId = atendenteId ? Number(atendenteId) : undefined;
    const anamneseData = { ...raw, ...(atId ? { atendenteId: atId } : {}) } as typeof anamneseTable.$inferInsert;

    try {
      const result = await db.transaction(async (tx) => {
        /* ------------ ficha mestre ------------- */
        const savedRows = anamneseId
          ? await tx
              .update(anamneseTable)
              .set({ ...anamneseData, updatedAt: new Date() })
              .where(and(eq(anamneseTable.id, anamneseId), eq(anamneseTable.organizationId, orgId)))
              .returning()
          : await tx
              .insert(anamneseTable)
              .values({ ...anamneseData, organizationId: orgId, atendenteId: atId ?? 1 })
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

        for (const item of items) {
          // busca validade/validade1
          const [v] = await tx
            .select({ v0: ex.validade, v1: ex.validade1 })
            .from(ex)
            .where(eq(ex.id, item.exameId))
            .limit(1);
          if (!v) throw new ActionError(t('Errors.exam_not_found'));

          // conta exames anteriores
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

        return buildSuccess(anamnese);
      });

      revalidatePath('/dashboard/anamnese');
      return result;
    } catch (e) {
      console.error('upsertAnamnese', e);
      throw new ActionError('Erro BD');
    }
  });

/* ================================================================
 * ACTION 2 → deleteAnamnese (soft-delete)
 * ============================================================== */
export const deleteAnamnese = protectedAction
  .schema(z.object({ id: z.number() }))
  .action(async ({ parsedInput: { id }, ctx: { orgId } }) => {
    if (!orgId) throw new ActionError('unauthorized');

    try {
      await db.transaction(async (tx) => {
        const rows = await tx
          .update(anamneseTable)
          .set({ status: 'CANCELADA', updatedAt: new Date() })
          .where(and(eq(anamneseTable.id, id), eq(anamneseTable.organizationId, orgId)))
          .returning({ id: anamneseTable.id });

        if (!rows.length) throw new ActionError('Registro não encontrado');

        await tx.delete(anamneseItemsTable).where(eq(anamneseItemsTable.anamneseId, id));
      });

      revalidatePath('/dashboard/anamnese');
      return { success: true };
    } catch (e) {
      console.error('deleteAnamnese', e);
      throw new ActionError('Erro ao excluir');
    }
  });
