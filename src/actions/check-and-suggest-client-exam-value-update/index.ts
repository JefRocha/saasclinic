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
        const currentClientExamValue = Number(existingClientExam[0].valor);
        console.log("Raw value from DB:", existingClientExam[0].valor);
        console.log("Converted value:", currentClientExamValue);
        if (currentClientExamValue !== newAnamneseItemValue) {
          suggestion = {
            clientId,
            exameId,
            currentClientExamValue,
            newAnamneseItemValue,
          };
        }
      } else {
        // Se não existe, sugere a inserção como uma nova entrada
        suggestion = {
          clientId,
          exameId,
          currentClientExamValue: 0, // Indica uma nova entrada
          newAnamneseItemValue,
        };
      }

      return suggestion;
    } catch (e) {
      console.error('checkAndSuggestClientExamValueUpdate', e);
      throw new ActionError('Erro ao verificar valor do exame do cliente.');
    }
  });
