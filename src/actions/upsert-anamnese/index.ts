'use server';

import { and, eq, notInArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import ptBRMessages from '@/locales/pt-BR.json';


import { anamneseTable, anamneseItemsTable } from '@/models/Schema';
import { db } from '@/libs/DB';
import { ActionError } from '@/libs/action-error';
import { protectedAction } from '@/libs/safe-action';

import { upsertAnamneseSchema } from './schema';

// Helper functions for consistent response structure
const buildSuccessResponse = <T>(data: T) => ({ success: true, data });


export const upsertAnamnese = protectedAction
  .schema(upsertAnamneseSchema)
  .action(async ({ parsedInput: data, ctx: { orgId } }) => {
    const t = (key: string) => {
      const keys = key.split('.');
      let current: any = ptBRMessages;
      for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
          current = current[k];
        } else {
          return key; // Fallback para a chave se não encontrada
        }
      }
      return current;
    };

    if (!orgId) {
      console.error("Erro: orgId não encontrado.");
      throw new ActionError(t('Errors.unauthorized'));
    }

    const { id: anamneseId, items, ...anamneseData } = data;

    try {
      console.log("Iniciando transação DB para upsertAnamnese...");
      const result = await db.transaction(async (tx) => {
        // 1. Inserir ou Atualizar a Anamnese (Mestre)
        const [savedAnamnese] = anamneseId
          ? await tx
              .update(anamneseTable)
              .set({
                ...anamneseData,
                updatedAt: new Date(),
              })
              .where(
                and(
                  eq(anamneseTable.id, anamneseId),
                  eq(anamneseTable.organizationId, orgId)
                )
              )
              .returning()
          : await tx
              .insert(anamneseTable)
              .values({
                ...anamneseData,
                organizationId: orgId,
                // TODO: Adicionar o ID do atendente logado
                atendenteId: 1, // Placeholder
              })
              .returning();

        if (!savedAnamnese) {
          tx.rollback();
          throw new ActionError(t('Errors.database_error'));
        }

        // 2. Sincronizar os Itens (Detalhe)
        const newItemIds = items.map(item => item.id).filter((id): id is number => typeof id === 'number');

        // Remover itens que não estão mais na lista
        if (anamneseId) {
            await tx.delete(anamneseItemsTable).where(
                and(
                    eq(anamneseItemsTable.anamneseId, savedAnamnese.id),
                    notInArray(anamneseItemsTable.id, newItemIds)
                )
            );
        }

        // Inserir ou Atualizar os itens da anamnese
        for (const item of items) {
          if (item.id) { // Atualizar item existente
            await tx.update(anamneseItemsTable)
              .set({
                ...item,
                valor: item.valor !== undefined ? String(item.valor) : undefined,
              })
              .where(eq(anamneseItemsTable.id, item.id));
          } else { // Inserir novo item
            await tx.insert(anamneseItemsTable).values({
              ...item,
              anamneseId: savedAnamnese.id,
              valor: item.valor !== undefined ? String(item.valor) : undefined,
            });
          }
        }

        return buildSuccessResponse(savedAnamnese);
      });

      revalidatePath('/[locale]/dashboard/anamnese');
      console.log("Transação DB para upsertAnamnese concluída.");
      return result;

    } catch (error) {
      console.error("Erro na upsertAnamnese:", error);
      throw new ActionError(t('Errors.database_error'));
    }
  }
);
