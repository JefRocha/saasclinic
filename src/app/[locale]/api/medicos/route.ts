export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

import { db } from '@/db';
import { medicosTable } from '@/models/Schema';
import { eq, and, ilike, sql } from 'drizzle-orm';

import { upsertMedicoSchema, searchMedicosSchema } from '@/actions/upsert-medico/schema';
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
    if (!ability.can(Action.Read, 'Medico')) return jsonError('Forbidden', 403);

    const url = new URL(req.url);
    const parsed = searchMedicosSchema.safeParse({
      search : url.searchParams.get('search') || '',
      page   : parseInt(url.searchParams.get('page') || '1'),
      order  : url.searchParams.get('order')  || 'asc',
      orderBy: url.searchParams.get('orderBy') || 'nome',
    });
    if (!parsed.success) return jsonError('Parâmetros inválidos');

    const { search, page, order, orderBy } = parsed.data;
    const limit  = 10;
    const offset = (page - 1) * limit;

    const whereOrg = ability.can(Action.Manage, 'all')
      ? sql`1=1`                                   // super_admin → ignora filtro
      : eq(medicosTable.organizationId, orgId);    // demais papéis → filtra

    const where = and(
      whereOrg,
      search
        ? ilike(medicosTable.nome, `%${search}%`)
        : undefined
    );

    const [medicos, [{ count } = { count: 0 }]] = await Promise.all([
      db.select().from(medicosTable)
        .where(where)
        .orderBy(
          order === 'desc'
            ? sql`${medicosTable[orderBy]} DESC`
            : sql`${medicosTable[orderBy]} ASC`,
        )
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(medicosTable).where(where),
    ]);

    return NextResponse.json({
      data: medicos,
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (e) {
    console.error('GET /api/medicos ‒ erro:', e);
    return NextResponse.json(
      { error: 'Internal error', detail: String(e) },
      { status: 500 },
    );
  }
}

/* ------------------------------------------------------------------ */
/* POST: cria / atualiza médico                                       */
/* ------------------------------------------------------------------ */
export async function POST(req: NextRequest) {
  try {  
    const { ability, role, orgId } = await abilityForRequest();

    // 1. permissão CASL
    if (!ability.can(Action.Create, 'Medico')) return jsonError('Forbidden', 403);

    // 2. valida payload
    const body   = await req.json();
    const parsed = upsertMedicoSchema.safeParse(body);
    if (!parsed.success) return jsonError('Dados inválidos');

    // 3. decidir em qual organização gravar
    const finalOrgId =
      role === 'super_admin' ? parsed.data.organizationId : orgId;

    if (!finalOrgId)
    return jsonError('organizationId ausente (super_admin precisa escolher)');

    /* 4. prossegue com o insert/update do médico */
    const medicoData = { ...parsed.data, organizationId: finalOrgId };

    const [resultMedico] = await db
      .insert(medicosTable)
      .values({
        ...medicoData,
        usaAgenda: medicoData.usaAgenda ? 1 : 0, // Converte boolean para 0/1
      })
      .onConflictDoUpdate({
        target: [medicosTable.id],
        set: {
          ...medicoData,
          usaAgenda: medicoData.usaAgenda ? 1 : 0, // Converte boolean para 0/1
        },
      })
      .returning();

    return NextResponse.json({ success: true, medico: resultMedico[0] }, { status: 201 });
  } catch (e) {
    console.error('POST /api/medicos ‒ erro:', e);
    return NextResponse.json(
      { error: 'Internal error', detail: String(e) },
      { status: 500 },
    );
  }
}

/* ------------------------------------------------------------------ */
/* DELETE: remove médico                                              */
/* ------------------------------------------------------------------ */
export async function DELETE(req: NextRequest) {
  const { ability, role, orgId } = await abilityForRequest();
  if (!ability.can(Action.Delete, 'Medico')) return jsonError('Forbidden', 403);

  const id = new URL(req.url).searchParams.get('id');
  if (!id) return jsonError('ID do médico não fornecido');

  const medico = await db.query.medicosTable.findFirst({
    where: eq(medicosTable.id, Number(id)),
  });
  if (!medico) return jsonError('Médico não encontrado', 404);

  // super_admin pode deletar qualquer médico; demais verificam orgId
  if (role !== 'super_admin' && medico.organizationId !== orgId)
    return jsonError('Você não tem permissão para excluir este médico', 403);

  await db.delete(medicosTable).where(eq(medicosTable.id, Number(id)));
  return NextResponse.json({ success: true });
}