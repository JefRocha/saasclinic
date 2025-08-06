'use server';

import { eq } from 'drizzle-orm';
import ptBRMessages from '@/locales/pt-BR.json';
import { z } from 'zod';

import { examesTable } from '@/models/Schema';
import { db } from '@/libs/DB';
import { ActionError } from '@/libs/action-error';
import { protectedClient } from '@/libs/safe-action';

const GetExamesForSelectSchema = z.object({});

export const getExamesForSelect = protectedClient.schema(
  GetExamesForSelectSchema,
).action(async ({ ctx }) => {
    const { orgId } = ctx;
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

    

    try {
      const exames = await db
        .select({
          id: examesTable.id,
          name: examesTable.descricao,
        })
        .from(examesTable)
        .where(eq(examesTable.organizationId, orgId));

      return { success: true, data: exames };
    } catch (error) {
      console.error("Erro ao buscar exames para select:", error);
      throw new ActionError(t('Errors.database_error'));
    }
  });
