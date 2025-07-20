import { NextRequest, NextResponse } from "next/server";

import { searchClients } from "@/actions/upsert-client";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") || undefined;
  const page = Number(searchParams.get("page")) || 1;
  const order = searchParams.get("order") || undefined;
  const orderBy = searchParams.get("orderBy") || undefined;
  try {
    const result = await searchClients({ search, page, order, orderBy });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 401 },
    );
  }
}
