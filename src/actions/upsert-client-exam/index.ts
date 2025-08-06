'use server';

import { db } from '@/db';
import { examesCliTable } from '@/models/Schema';
import { protectedClient } from '@/libs/safe-action';
import { eq } from 'drizzle-orm';
import { upsertClientExamSchema } from './schema';

export const upsertClientExam = protectedClient
  .schema(upsertClientExamSchema)
  .action(
  async ({ id, clientId, exameId, valor }, { userId, orgId }) => {
    if (!orgId) {
      throw new Error("Organization ID is required.");
    }

    const data = {
      idcliente: clientId,
      idexame: exameId,
      valor: valor,
      // A descrição e o cargo não são obrigatórios para esta tabela
      // e podem ser inferidos do exame principal se necessário.
      // codExameAnt também não é obrigatório.
    };

    if (id) {
      // Atualiza o registro existente
      await db.update(examesCliTable)
        .set(data)
        .where(eq(examesCliTable.id, id));
    } else {
      // Insere um novo registro
      await db.insert(examesCliTable).values(data);
    }

    return { success: true };
  },
);
