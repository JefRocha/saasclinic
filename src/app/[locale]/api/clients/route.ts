import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { clientsTable } from "@/models/Schema";
import { and, ilike, sql, eq } from "drizzle-orm";
import { searchClientsSchema } from "@/actions/upsert-client/schema";

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

  // ✅ corrige: bloco `where` era inválido
  const where = and(
    eq(clientsTable.organizationId, orgId),
    ilike(clientsTable.razaoSocial, `%${search}%`)
  );

  // ✅ corrige: estrutura do Promise.all estava fora de lugar
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
