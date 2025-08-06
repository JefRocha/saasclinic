'use server';

import { protectedClient, ActionError } from "@/libs/safe-action";
import { z } from "zod";

export const testAction = protectedClient
  .schema(z.object({ message: z.string() }))
  .action(async ({ parsedInput }, { orgId, userId }) => {
    console.log("Test Action Executed!");
    console.log("Message:", parsedInput.message);
    console.log("Org ID:", orgId);
    console.log("User ID:", userId);

    if (!orgId) {
      throw new ActionError("Org ID is undefined in test action.");
    }

    return { success: true, orgId, userId };
  });
