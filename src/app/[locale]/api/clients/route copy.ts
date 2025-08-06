export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { clientsTable, organizationSchema } from "@/models/Schema";
import { and, ilike, sql, eq } from "drizzle-orm";
import { searchClientsSchema, upsertClientSchema } from "@/actions/upsert-client/schema";

export async function GET(req: NextRequest) {
  const { orgId } = await auth();

  if (!orgId) {
    return NextResponse.json({ error: "Organização não encontrada" }, { status: 401 });
  }

  const url = new URL(req.url);
  const params = {
    search: url.searchParams.get("search") || "",
    page: parseInt(url.searchParams.get("page") || "1"),
    order: url.searchParams.get("order") || "asc",
    orderBy: url.searchParams.get("orderBy") || "razaoSocial",
  };

  const parseResult = searchClientsSchema.safeParse(params);
  if (!parseResult.success) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  const { search, page, order, orderBy } = parseResult.data;
  const limit = 10;
  const offset = (page - 1) * limit;

  const where = and(
    eq(clientsTable.organizationId, orgId),
    ilike(clientsTable.razaoSocial, `%${search}%`)
  );

  const [clients, countResult] = await Promise.all([
    db
      .select()
      .from(clientsTable)
      .where(where)
      .orderBy(
        orderBy in clientsTable
          ? (order === "desc"
              ? sql`${clientsTable[orderBy]} DESC`
              : sql`${clientsTable[orderBy]} ASC`)
          : clientsTable.razaoSocial
      )
      .limit(limit)
      .offset(offset),

    db
      .select({ count: sql<number>`count(*)` })
      .from(clientsTable)
      .where(where),
  ]);

  const count = countResult?.[0]?.count || 0;

  return NextResponse.json({
    data: clients,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  });
}

export async function POST(req: NextRequest) {
  const { orgId } = await auth();

  if (!orgId) {
    return NextResponse.json({ error: "Organização não encontrada" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = upsertClientSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Verifica se a organização já existe no banco
    const [organization] = await db
      .select()
      .from(organizationSchema)
      .where(eq(organizationSchema.id, orgId))
      .limit(1);

    // Se não existir, cria uma nova com dados mínimos
    if (!organization) {
      await db.insert(organizationSchema).values({
        id: orgId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).execute();
    }

    const clientData = { ...parsed.data, organizationId: orgId };
    console.log("Dados prontos para insert:", clientData);
    const result = clientData.id
      ? await db
          .update(clientsTable)
          .set(clientData)
          .where(eq(clientsTable.id, clientData.id))
          .returning()
      : await db.insert(clientsTable).values(clientData).returning();
      console.log("Resultado do insert:", result);

    return NextResponse.json({ success: true, client: result[0] }, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao processar requisição POST para clientes:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { orgId } = await auth();

  if (!orgId) {
    return NextResponse.json({ error: "Organização não encontrada" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID do cliente não fornecido" }, { status: 400 });
    }

    const clientToDelete = await db.query.clientsTable.findFirst({
      where: eq(clientsTable.id, Number(id)),
    });

    if (!clientToDelete) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    if (clientToDelete.organizationId !== orgId) {
      return NextResponse.json({ error: "Você não tem permissão para excluir este cliente." }, { status: 403 });
    }

    await db.delete(clientsTable).where(eq(clientsTable.id, Number(id)));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao processar requisição DELETE para clientes:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor", details: error.message },
      { status: 500 }
    );
  }
}
