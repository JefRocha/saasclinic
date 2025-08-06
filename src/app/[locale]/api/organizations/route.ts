// src/app/[locale]/api/organizations/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { organizationSchema } from '@/models/Schema';
import { auth, currentUser } from '@clerk/nextjs/server';
import { buildAbility } from '@/lib/ability';
import { eq } from 'drizzle-orm';

export async function GET() {
  const { orgId }        = await auth();
  const user             = await currentUser();
  const role             = user?.publicMetadata?.role as string;
  const ability          = buildAbility(role, orgId ?? undefined);

  if (!ability.can('read', 'Organization'))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // super_admin vê todas; outros veem só a própria org
  const orgs = ability.can('manage', 'all')
    ? await db.select().from(organizationSchema).orderBy(organizationSchema.nome)
    : await db.select().from(organizationSchema).where(eq(organizationSchema.id, orgId));

  return NextResponse.json(orgs);   // sempre array
}
