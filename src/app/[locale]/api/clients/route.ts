export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

import { db } from '@/db';
import { clientsTable, organizationSchema } from '@/models/Schema';
import { and, ilike, sql, eq } from 'drizzle-orm';
import {
  searchClientsSchema,
  upsertClientSchema,
} from '@/actions/upsert-client/schema';

import { buildAbility, Action } from '@/lib/ability';

async function abilityForRequest() {
  const { orgId } = await auth();
  const user      = await currentUser();
  const ability   = buildAbility(
    user?.publicMetadata?.role as string,
    orgId ?? undefined,
  );
  return { ability, orgId, user };
}


/* ---------- helpers locais ------------------------------------------ */
function err(msg: string, status: number) {
  return NextResponse.json({ error: msg }, { status });
}

async function getAbility() {
  const user = await currentUser();          // Clerk user
  const role = user?.publicMetadata?.role;   // admin | editor | viewer
  return buildAbility(role as string);
}

/* =========================  GET  ==================================== */
export async function GET(req: NextRequest) {
  const { orgId } = await auth();
  if (!orgId) return err('Organização não encontrada', 401);

  const ability = await getAbility();
  if (!ability.can(Action.Read, 'Client')) return err('Forbidden', 403);

  /* ---------- sua lógica original ---------- */
  const url = new URL(req.url);
  const parseResult = searchClientsSchema.safeParse({
    search:  url.searchParams.get('search')  || '',
    page:    parseInt(url.searchParams.get('page') || '1'),
    order:   url.searchParams.get('order')   || 'asc',
    orderBy: url.searchParams.get('orderBy') || 'razaoSocial',
  });
  if (!parseResult.success) return err('Parâmetros inválidos', 400);

  const { search, page, order, orderBy } = parseResult.data;
  const limit  = 10;
  const offset = (page - 1) * limit;

  const where = and(
    eq(clientsTable.organizationId, orgId),
    ilike(clientsTable.razaoSocial, `%${search}%`)
  );

  const [clients, [{ count } = { count: 0 }]] = await Promise.all([
    db
      .select()
      .from(clientsTable)
      .where(where)
      .orderBy(
        orderBy in clientsTable
          ? (order === 'desc'
              ? sql`${clientsTable[orderBy]} DESC`
              : sql`${clientsTable[orderBy]} ASC`)
          : clientsTable.razaoSocial
      )
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(clientsTable).where(where),
  ]);

  return NextResponse.json({
    data: clients,
    pagination: {
      page,
      limit,
      total:      count,
      totalPages: Math.ceil(count / limit),
    },
  });
}

/* =========================  POST  ==================================== */
export async function POST(req: NextRequest) {
  const { ability, orgId, user } = await abilityForRequest();
  if (!orgId && user?.publicMetadata?.role !== 'super_admin')
    return err('Organização não encontrada', 401);

  if (!ability.can(Action.Create, 'Client'))
    return err('Forbidden', 403);

  const body = await req.json();
  const parsed = upsertClientSchema.safeParse(body);
  if (!parsed.success) return err('Dados inválidos', 400);

  /* -- qual organização gravar? -- */
  const finalOrgId =
    user?.publicMetadata?.role === 'super_admin'
      ? parsed.data.organizationId   // deve vir no body/ formulário
      : orgId;

  if (!finalOrgId)
    return err('organizationId ausente', 400);

  /* --------- mantém sua lógica de insert/update -------- */
  const [org] = await db
    .select()
    .from(organizationSchema)
    .where(eq(organizationSchema.id, finalOrgId))
    .limit(1);

  if (!org) {
    await db.insert(organizationSchema).values({
      id: finalOrgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  const clientData = { ...parsed.data, organizationId: finalOrgId };
  const result = clientData.id
    ? await db.update(clientsTable)
        .set(clientData)
        .where(eq(clientsTable.id, clientData.id))
        .returning()
    : await db.insert(clientsTable).values(clientData).returning();

  return NextResponse.json({ success: true, client: result[0] }, { status: 200 });
}


/* =========================  DELETE  ================================== */
export async function DELETE(req: NextRequest) {
  const { ability, orgId, user } = await abilityForRequest();
  if (!ability.can(Action.Delete, 'Client'))
    return err('Forbidden', 403);

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return err('ID do cliente não fornecido', 400);

  const client = await db.query.clientsTable.findFirst({
    where: eq(clientsTable.id, Number(id)),
  });
  if (!client) return err('Cliente não encontrado', 404);

  /* se não for super_admin, confere se pertence à própria org */
  if (
    user?.publicMetadata?.role !== 'super_admin' &&
    client.organizationId !== orgId
  ) {
    return err('Você não tem permissão para excluir este cliente', 403);
  }

  await db.delete(clientsTable).where(eq(clientsTable.id, Number(id)));
  return NextResponse.json({ success: true }, { status: 200 });
}
