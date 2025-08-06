'use server';

import { protectedClient } from '@/libs/safe-action';
import { upsertColaboradorSchema } from './schema';
import { db } from '@/db';
import { colaboradorTable } from '@/models/Schema';
import { eq } from 'drizzle-orm';

export const upsertColaborador = protectedClient.schema(
  upsertColaboradorSchema,
).action(
  async (input, { orgId }) => {

    if (input.id) {
      // Update existing colaborador
      const [updatedColaborador] = await db
        .update(colaboradorTable)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(colaboradorTable.id, input.id))
        .returning();
      return updatedColaborador;
    } else {
      // Insert new colaborador
      const [newColaborador] = await db
        .insert(colaboradorTable)
        .values({
          ...input,
          organizationId: orgId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      return newColaborador;
    }
  },
);
