export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

import { db } from '@/db';
import { examesTable } from '@/models/Schema';
import { eq, and, ilike, sql, or } from 'drizzle-orm';

import { upsertExameSchema, searchExamesSchema } from '@/actions/upsert-exame/schema';
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
/* GET: lista paginada                                                */
/* ------------------------------------------------------------------ */
export async function GET(req: NextRequest) {
  try {
    const { ability, orgId } = await abilityForRequest();
    if (!ability.can(Action.Read, 'Exame')) return jsonError('Forbidden', 403);

    const url = new URL(req.url);
    const parsed = searchExamesSchema.safeParse({
      search : url.searchParams.get('search') || '',
      page   : parseInt(url.searchParams.get('page') || '1'),
      order  : url.searchParams.get('order')  || 'asc',
      orderBy: url.searchParams.get('orderBy') || 'descricao',
    });
    if (!parsed.success) return jsonError('Parâmetros inválidos');

    const { search, page, order, orderBy } = parsed.data;
    const limit  = 10;
    const offset = (page - 1) * limit;

    const whereOrg = ability.can(Action.Manage, 'all')
      ? sql`1=1`                                   // super_admin → ignora filtro
      : eq(examesTable.organizationId, orgId);    // demais papéis → filtra

    const where = and(
      whereOrg,
      search
        ? ilike(examesTable.descricao, `%${search}%`)
        : undefined
    );

    const [exames, [{ count } = { count: 0 }]] = await Promise.all([
      db.select().from(examesTable)
        .where(where)
        .orderBy(
          order === 'desc'
            ? sql`${examesTable[orderBy]} DESC`
            : sql`${examesTable[orderBy]} ASC`,
        )
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(examesTable).where(where),
    ]);

    return NextResponse.json({
      data: exames,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (e) {
    console.error('GET /api/exames ‒ erro:', e);
    return NextResponse.json(
      { error: 'Internal error', detail: String(e) },
      { status: 500 },
    );
  }
}

/* ------------------------------------------------------------------ */
/* POST: cria / atualiza exame                                        */
/* ------------------------------------------------------------------ */
export async function POST(req: NextRequest) {
  try {  
    const { ability, role, orgId } = await abilityForRequest();

    // 1. permissão CASL
    if (!ability.can(Action.Create, 'Exame')) return jsonError('Forbidden', 403);

    // 2. valida payload
    const body   = await req.json();
    const parsed = upsertExameSchema.safeParse(body);
    if (!parsed.success) return jsonError('Dados inválidos');

    // 3. decidir em qual organização gravar
    const finalOrgId =
      role === 'super_admin' ? parsed.data.organizationId : orgId;

    if (!finalOrgId)
    return jsonError('organizationId ausente (super_admin precisa escolher)');

    /* 4. prossegue com o insert/update do exame */
    const exameData = { ...parsed.data, organizationId: finalOrgId };

    const [resultExame] = await db
      .insert(examesTable)
      .values(exameData)
      .onConflictDoUpdate({
        target: [examesTable.id],
        set: exameData,
      })
      .returning();

    return NextResponse.json({ success: true, exame: resultExame[0] }, { status: 201 });
  } catch (e) {
    console.error('POST /api/exames ‒ erro:', e);
    return NextResponse.json(
      { error: 'Internal error', detail: String(e) },
      { status: 500 },
    );
  }
}

/* ------------------------------------------------------------------ */
/* DELETE: remove exame                                               */
/* ------------------------------------------------------------------ */
export async function DELETE(req: NextRequest) {
  const { ability, role, orgId } = await abilityForRequest();
  if (!ability.can(Action.Delete, 'Exame')) return jsonError('Forbidden', 403);

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return jsonError('ID do exame não fornecido');

  const exame = await db.query.examesTable.findFirst({
    where: eq(examesTable.id, Number(id)),
  });
  if (!exame) return jsonError('Exame não encontrado', 404);

  // super_admin pode deletar qualquer exame; demais verificam orgId
  if (role !== 'super_admin' && exame.organizationId !== orgId)
    return jsonError('Você não tem permissão para excluir este exame', 403);

  await db.delete(examesTable).where(eq(examesTable.id, Number(id)));
  return NextResponse.json({ success: true });
}