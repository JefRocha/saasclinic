import { NextResponse } from "next/server";

import { getUserRoleServer } from "@/lib/get-user-role";

export async function GET() {
  try {
    const role = await getUserRoleServer();
    return NextResponse.json({ role });
  } catch (error) {
    return NextResponse.json({ role: "user" }, { status: 200 });
  }
}
