'use server';

import { and, eq } from 'drizzle-orm';
import { db } from "@/db";
import { examesCliTable } from '@/models/Schema';
import { protectedClient, ActionError } from '@/libs/safe-action';
import { checkAndSuggestClientExamValueUpdateSchema, CheckAndSuggestClientExamValueUpdateResult } from './schema';

export const checkAndSuggestClientExamValueUpdate = protectedClient
  .schema(checkAndSuggestClientExamValueUpdateSchema)
  .action(async ({ parsedInput, ctx: { orgId } }) => {
    const { clientId, exameId, newAnamneseItemValue } = parsedInput;

    try {
      const existingClientExam = await db
        .select()
        .from(examesCliTable)
        .where(
          and(
            eq(examesCliTable.idcliente, clientId),
            eq(examesCliTable.idexame, exameId)
          )
        )
        .limit(1);

      let suggestion: CheckAndSuggestClientExamValueUpdateResult['suggestion'] = null;

      if (existingClientExam.length > 0) {
        const currentClientExamValue = Number(existingClientExam[0].valor || 0);
        if (currentClientExamValue !== newAnamneseItemValue) {
          suggestion = {
            clientId,
            exameId,
            currentClientExamValue: currentClientExamValue.toFixed(2),
            newAnamneseItemValue: newAnamneseItemValue.toFixed(2),
          };
        }
      } else {
        // Se não existe, sugere a inserção como uma nova entrada
        suggestion = {
          clientId,
          exameId,
          currentClientExamValue: (0).toFixed(2), // Indica uma nova entrada
          newAnamneseItemValue: newAnamneseItemValue.toFixed(2),
        };
      }

      return suggestion;
    } catch (e) {
      console.error('checkAndSuggestClientExamValueUpdate', e);
      throw new ActionError('Erro ao verificar valor do exame do cliente.');
    }
  });
