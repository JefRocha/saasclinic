import { NextRequest, NextResponse } from 'next/server';
import { currentUser, auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { organizationsTable } from '@/models/Schema';
import { eq } from 'drizzle-orm';
import { buildAbility, Action } from '@/lib/ability';

function err(msg: string, status: number) {
  return NextResponse.json({ error: msg }, { status });
}

/* ---------- GET /api/organizations ---------- */
export async function GET() {
  const { orgId } = await auth();                    // null p/ super_admin
  const user      = await currentUser();
  if (!user) return err('Unauthorized', 401);

  const ability   = buildAbility(user.publicMetadata.role as string, orgId);

  if (!ability.can(Action.Read, 'Organization'))
    return err('Forbidden', 403);

  // super_admin: sem filtro  |  admin: filtra pela sua org
  const data = ability.can(Action.Manage, 'all')
    ? await db.select().from(organizationsTable)
    : await db.select().from(organizationsTable).where(eq(organizationsTable.id, orgId));

  return NextResponse.json(data);
}

/* ---------- PATCH /api/organizations/:id (exemplo) ---------- */
export async function PATCH(req: NextRequest) {
  const { orgId } = await auth();
  const user      = await currentUser();
  if (!user) return err('Unauthorized', 401);

  const ability   = buildAbility(user.publicMetadata.role as string, orgId);
  const body      = await req.json();
  const id        = body.id;                       // id da org

  if (!ability.can(Action.Update, 'Organization', { id }))
    return err('Forbidden', 403);

  await db.update(organizationsTable)
          .set(body)
          .where(eq
