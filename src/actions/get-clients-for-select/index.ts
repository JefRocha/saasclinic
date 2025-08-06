'use server';

import { eq } from 'drizzle-orm';
import ptBRMessages from '@/locales/pt-BR.json';
import { z } from 'zod';

import { clientsTable } from '@/models/Schema';
import { db } from '@/libs/DB';
import { ActionError } from '@/libs/action-error';
import { protectedClient } from '@/libs/safe-action';
import { unstable_noStore as noStore } from 'next/cache';

const GetClientsForSelectSchema = z.object({});

export const getClientsForSelect = protectedClient.schema(
  GetClientsForSelectSchema,
).action(async ({ ctx }) => {
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
      const clients = await db
        .select({
          id: clientsTable.id,
          name: clientsTable.fantasia,
          cpf: clientsTable.cpf,
        })
        .from(clientsTable)
        .where(eq(clientsTable.organizationId, orgId));

      return { success: true, data: clients };
    } catch (error) {
      console.error("Erro ao buscar clientes para select:", error);
      throw new ActionError(t('Errors.database_error'));
    }
  });