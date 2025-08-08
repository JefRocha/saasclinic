'use server';

import { eq } from 'drizzle-orm';
import ptBRMessages from '@/locales/pt-BR.json';
import { z } from 'zod';

import { colaboradorTable } from '@/models/Schema';
import { db } from '@/libs/DB';
import { ActionError } from '@/libs/action-error';
import { protectedClient } from '@/libs/safe-action';
import { unstable_noStore as noStore } from 'next/cache';

const GetColaboradoresForSelectSchema = z.object({});

export const getColaboradoresForSelect = protectedClient
  .schema(GetColaboradoresForSelectSchema)
  .action(async ({ ctx }) => {
    const { orgId } = ctx;
    noStore(); // Impede o cache da requisição

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
      const colaboradores = await db
        .select({
          id: colaboradorTable.id,
          name: colaboradorTable.name,
          cpf: colaboradorTable.cpf,
        })
        .from(colaboradorTable)
        .where(eq(colaboradorTable.organizationId, orgId));
      
      return { success: true, data: colaboradores };
    } catch (error) {
      console.error("Erro ao buscar colaboradores para select:", error);
      throw new ActionError(t('Errors.database_error'));
    }
  });
