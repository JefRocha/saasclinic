'use server';

import { db } from '@/db';
import { examesCliTable } from '@/models/Schema';
import { protectedClient } from '@/libs/safe-action';
import { eq } from 'drizzle-orm';
import { upsertClientExamSchema } from './schema';
import { auth } from "@clerk/nextjs/server";

export const upsertClientExam = protectedClient
  .schema(upsertClientExamSchema)
  .action(
  async (actionInput) => {
    const { id, clientId, exameId, valor } = actionInput.parsedInput;
    const { userId, orgId } = await auth();
    console.log("upsertClientExam auth context:", { userId, orgId });
    if (!orgId) {
      throw new Error("Organization ID is required.");
    }

    const data = {
      idcliente: clientId,
      idexame: exameId,
      valor: valor,
    };

    if (id) {
      await db.update(examesCliTable)
        .set(data)
        .where(eq(examesCliTable.id, id));
    } else {
      await db.insert(examesCliTable).values(data);
    }

    return { success: true };
  },
);
