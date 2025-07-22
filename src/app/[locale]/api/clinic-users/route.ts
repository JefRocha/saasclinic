import { NextRequest, NextResponse } from "next/server";

import { deleteUser, getClinicUsers, upsertUser } from "@/actions/users";

export async function GET(req: NextRequest) {
  try {
    const users = await getClinicUsers(req.headers);
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 401 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await upsertUser({ ...body, headers: req.headers });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    await deleteUser({ id: body.id, headers: req.headers });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
