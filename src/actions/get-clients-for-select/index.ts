'use server';

import { eq } from 'drizzle-orm';
import ptBRMessages from '@/locales/pt-BR.json';
import { z } from 'zod';

import { clientsTable } from '@/models/Schema';
import { db } from '@/libs/DB';
import { ActionError } from '@/libs/action-error';
import { protectedAction } from '@/libs/safe-action';

const GetClientsForSelectSchema = z.object({});

export const getClientsForSelect = protectedAction
  .schema(GetClientsForSelectSchema)
  .action(async ({ ctx: { orgId } }) => {
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
      const clients = await db
        .select({
          id: clientsTable.id,
          name: clientsTable.fantasia,
        })
        .from(clientsTable)
        .where(eq(clientsTable.organizationId, orgId));

      return { success: true, data: clients };
    } catch (error) {
      console.error("Erro ao buscar clientes para select:", error);
      throw new ActionError(t('Errors.database_error'));
    }
  });