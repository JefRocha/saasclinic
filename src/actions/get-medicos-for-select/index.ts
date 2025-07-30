'use server';

import { eq } from 'drizzle-orm';
import ptBRMessages from '@/locales/pt-BR.json';
import { z } from 'zod';

import { medicosTable } from '@/models/Schema';
import { db } from '@/libs/DB';
import { ActionError } from '@/libs/action-error';
import { protectedAction } from '@/libs/safe-action';

const GetMedicosForSelectSchema = z.object({});

export const getMedicosForSelect = protectedAction
  .schema(GetMedicosForSelectSchema)
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
      const medicos = await db
        .select({
          id: medicosTable.id,
          name: medicosTable.nome,
        })
        .from(medicosTable)
        .where(eq(medicosTable.organizationId, orgId));

      return { success: true, data: medicos };
    } catch (error) {
      console.error("Erro ao buscar médicos para select:", error);
      throw new ActionError(t('Errors.database_error'));
    }
  });
