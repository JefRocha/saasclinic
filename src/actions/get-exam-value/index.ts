'use server';

import { eq, and } from 'drizzle-orm';
import ptBRMessages from '@/locales/pt-BR.json';

import { examesTable, examesCliTable } from '@/models/Schema';
import { db } from '@/libs/DB';
import { ActionError } from '@/libs/action-error';
import { protectedClient } from '@/libs/safe-action';
import { GetExamValueSchema } from './schema';

export const getExamValue = protectedClient.schema(
  GetExamValueSchema,
).action(async ({ parsedInput: { exameId, clienteId }, ctx: { orgId } }) => {
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
      throw new ActionError(t('Errors.unauthorized'));
    }

    try {
      let valor = null;

      // 1. Tentar buscar na examesCliTable (preço específico do cliente)
      if (clienteId) {
        const clientExam = await db
          .select({ valor: examesCliTable.valor })
          .from(examesCliTable)
          .where(and(
            eq(examesCliTable.idexame, exameId),
            eq(examesCliTable.idcliente, clienteId)
          ))
          .limit(1);

        if (clientExam.length > 0) {
          valor = clientExam[0].valor;
        }
      }

      // 2. Se não encontrou na examesCliTable ou clienteId não foi fornecido, buscar na examesTable
      if (valor === null) {
        const generalExam = await db
          .select({ valor: examesTable.valor })
          .from(examesTable)
          .where(eq(examesTable.id, exameId))
          .limit(1);

        if (generalExam.length > 0) {
          valor = generalExam[0].valor;
        }
      }

      return { success: true, data: { valor } };
    } catch (error) {
      console.error("Erro ao buscar valor do exame:", error);
      throw new ActionError(t('Errors.database_error'));
    }
  });
