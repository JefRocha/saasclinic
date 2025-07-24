export const dynamic = 'force-dynamic';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

import { db } from '@/db';
import { clientsTable, organizationSchema } from '@/models/Schema';
import { eq, and, ilike, sql, or } from 'drizzle-orm';

import { upsertClientSchema, searchClientsSchema } from '@/actions/upsert-client/schema';
import { buildAbility, Action } from '@/lib/ability';

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
function jsonError(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

async function abilityForRequest() {
  const { orgId } = await auth();              // clínica ativa (pode ser null)
  const user      = await currentUser();       // usuário Clerk
  const role      = user?.publicMetadata?.role as string;
  const ability   = buildAbility(role, orgId ?? undefined);

  return { ability, role, orgId, user };
}

/* ------------------------------------------------------------------ */
/* GET: lista paginada (unchanged)                                     */
/* ------------------------------------------------------------------ */
export async function GET(req: NextRequest) {
  try {
    const { ability, orgId } = await abilityForRequest();
    if (!ability.can(Action.Read, 'Client')) return jsonError('Forbidden', 403);

    const url = new URL(req.url);
    const parsed = searchClientsSchema.safeParse({
      search : url.searchParams.get('search') || '',
      page   : parseInt(url.searchParams.get('page') || '1'),
      order  : url.searchParams.get('order')  || 'asc',
      orderBy: url.searchParams.get('orderBy') || 'razaoSocial',
    });
    if (!parsed.success) return jsonError('Parâmetros inválidos');

    const { search, page, order, orderBy } = parsed.data;
    const limit  = 10;
    const offset = (page - 1) * limit;

    const whereOrg = ability.can(Action.Manage, 'all')
      ? sql`1=1`                                   // super_admin → ignora filtro
      : eq(clientsTable.organizationId, orgId);    // demais papéis → filtra

    const where = and(
      whereOrg,
      or(
        ilike(clientsTable.razaoSocial, `%${search}%`),
        ilike(clientsTable.fantasia, `%${search}%`),
        ilike(clientsTable.cpf, `%${search}%`),
        ilike(clientsTable.celular, `%${search}%`),
        ilike(clientsTable.email, `%${search}%`),
        ilike(clientsTable.cidade, `%${search}%`),
      ),
    );

    const [clients, [{ count } = { count: 0 }]] = await Promise.all([
      db.select().from(clientsTable)
        .where(where)
        .orderBy(
          order === 'desc'
            ? sql`${clientsTable[orderBy]} DESC`
            : sql`${clientsTable[orderBy]} ASC`,
        )
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(clientsTable).where(where),
    ]);

    return NextResponse.json({
      data: clients,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (e) {
    console.error('GET /api/clients ‒ erro:', e);
    return NextResponse.json(
      { error: 'Internal error', detail: String(e) },
      { status: 500 },
    );
  }
}

/* ------------------------------------------------------------------ */
/* POST: cria / atualiza cliente                                      */
/* ------------------------------------------------------------------ */
export async function POST(req: NextRequest) {
  try {  
    const { ability, role, orgId, user } = await abilityForRequest();

    // 1. permissão CASL
    if (!ability.can(Action.Create, 'Client')) return jsonError('Forbidden', 403);

    // 2. valida payload
    const body   = await req.json();
    const parsed = upsertClientSchema.safeParse(body);
    if (!parsed.success) return jsonError('Dados inválidos');

    // 3. decidir em qual organização gravar
    const finalOrgId =
      role === 'super_admin' ? parsed.data.organizationId : orgId;

    if (!finalOrgId)
    return jsonError('organizationId ausente (super_admin precisa escolher)');

  /* 4. garante que a organização existe na tabela local */
    const [org] = await db
      .select()
      .from(organizationSchema)
      .where(eq(organizationSchema.id, finalOrgId))
      .limit(1);

    if (!org) {
      /* ── 4.1 busca dados diretamente no Clerk ── */
      const clerkOrg = await clerkClient.organizations.getOrganization({
        organizationId: finalOrgId,
      });

      /* clerkOrg.name sempre existe; created_at vem como epoch ms */
      const now = new Date();

      /* ── 4.2 faz UPSERT (ignora se outra req já inseriu) ── */
      await db
        .insert(organizationSchema)
        .values({
          id        : clerkOrg.id,
          nome      : clerkOrg.name,
          createdAt : now,
          updatedAt : now,
        })
        .onConflictDoNothing();          // drizzle-orm >=0.35
    }

    /* 5. prossegue com o insert/update do cliente */
    const clientData = { ...parsed.data, organizationId: finalOrgId };

    // Converte booleanos para 0/1 antes de salvar no banco
    const booleanFields = [
      "travado",
      "ativo",
      "inadimplente",
      "especial",
      "bloqueado",
      "usaFor",
    ];
    for (const field of booleanFields) {
      if (typeof clientData[field] === "boolean") {
        clientData[field] = clientData[field] ? 1 : 0;
      }
    }

    const result = clientData.id
      ? await db.update(clientsTable)
          .set(clientData)
          .where(eq(clientsTable.id, clientData.id))
          .returning()
      : await db.insert(clientsTable)
          .values(clientData)
          .returning();

    return NextResponse.json({ success: true, client: result[0] }, { status: 201 });
  } catch (e) {
    console.error('POST /api/clients ‒ erro:', e);
    return NextResponse.json(
      { error: 'Internal error', detail: String(e) },
      { status: 500 },
    );
  }
}

/* ------------------------------------------------------------------ */
/* DELETE: remove cliente                                             */
/* ------------------------------------------------------------------ */
export async function DELETE(req: NextRequest) {
  const { ability, role, orgId } = await abilityForRequest();
  if (!ability.can(Action.Delete, 'Client')) return jsonError('Forbidden', 403);

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return jsonError('ID do cliente não fornecido');

  const client = await db.query.clientsTable.findFirst({
    where: eq(clientsTable.id, Number(id)),
  });
  if (!client) return jsonError('Cliente não encontrado', 404);

  // super_admin pode deletar qualquer cliente; demais verificam orgId
  if (role !== 'super_admin' && client.organizationId !== orgId)
    return jsonError('Você não tem permissão para excluir este cliente', 403);

  await db.delete(clientsTable).where(eq(clientsTable.id, Number(id)));
  return NextResponse.json({ success: true });
}
