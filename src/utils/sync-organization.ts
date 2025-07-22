// utils/sync-organization.ts
import { db } from "@/db";
import { organizationsTable } from "@/models/Schema";
import { eq } from "drizzle-orm";

export async function ensureOrgExists(orgId: string, orgName: string) {
  const existing = await db
    .select()
    .from(organizationsTable)
    .where(eq(organizationsTable.id, orgId))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(organizationsTable).values({
      id: orgId,
      name: orgName,
      plan: "free", // ou o padrão que quiser
    });
  }
}
