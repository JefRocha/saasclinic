import { db } from "@/db";
import { organizationSchema } from "@/models/Schema";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/clerk-sdk-node";

export async function ensureOrganizationExistsInDb(orgId: string) {
  const [org] = await db
    .select()
    .from(organizationSchema)
    .where(eq(organizationSchema.id, orgId))
    .limit(1);

  if (!org) {
    const clerkOrg = await clerkClient.organizations.getOrganization({
      organizationId: orgId,
    });

    const now = new Date();

    await db
      .insert(organizationSchema)
      .values({
        id: clerkOrg.id,
        nome: clerkOrg.name,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing();
  }
}
