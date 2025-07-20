"use server";

import { and, asc, count, desc, eq, ilike } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { cache } from "react";
import { z } from "zod";

import { db } from "@/db";
import { usersTable, usersToClinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { action } from "@/lib/next-safe-action";

import { upsertUserSchema } from "./schema";

export async function upsertUser({
  name,
  email,
  id,
  headers: headersArg,
}: {
  name: string;
  email: string;
  id?: string;
  headers?: Headers;
}) {
  // Validação manual
  upsertUserSchema.parse({ name, email, id });
  const session = await auth.api.getSession({
    headers: headersArg ?? (await headers()),
  });
  if (!session?.user) throw new Error("Unauthorized");
  if (!session?.user.clinic?.id) throw new Error("Clinic not found");
  if (session.user.role !== "MASTER") throw new Error("Forbidden");
  let userId = id;
  if (!userId) {
    userId = crypto.randomUUID();
    await db.insert(usersTable).values({
      id: userId,
      name,
      email,
      emailVerified: false,
      role: "USER",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await db.insert(usersToClinicsTable).values({
      userId,
      clinicId: session.user.clinic.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } else {
    await db
      .update(usersTable)
      .set({ name, email, updatedAt: new Date() })
      .where(eq(usersTable.id, userId));
  }
  revalidatePath("/users");
}

export const getClinicUsers = cache(async (headersArg?: Headers) => {
  const session = await auth.api.getSession({
    headers: headersArg ?? (await headers()),
  });
  if (!session?.user) throw new Error("Unauthorized");
  if (!session?.user.clinic?.id) throw new Error("Clinic not found");
  if (session.user.role !== "MASTER") throw new Error("Forbidden");

  // Busca usuários vinculados à clínica
  const users = await db.query.usersToClinicsTable.findMany({
    where: eq(usersToClinicsTable.clinicId, session.user.clinic.id),
    with: { user: true },
    orderBy: desc(usersToClinicsTable.createdAt),
  });
  return users.map((u) => u.user);
});

export const getUserById = cache(
  async (userId: string, headersArg?: Headers) => {
    const session = await auth.api.getSession({
      headers: headersArg ?? (await headers()),
    });
    if (!session?.user) throw new Error("Unauthorized");
    if (!session?.user.clinic?.id) throw new Error("Clinic not found");
    if (session.user.role !== "MASTER") throw new Error("Forbidden");

    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
    });
    if (!user) throw new Error("User not found");
    return user;
  },
);

export async function deleteUser({
  id,
  headers: headersArg,
}: {
  id: string;
  headers?: Headers;
}) {
  if (!id) throw new Error("ID obrigatório");
  const session = await auth.api.getSession({
    headers: headersArg ?? (await headers()),
  });
  if (!session?.user) throw new Error("Unauthorized");
  if (!session?.user.clinic?.id) throw new Error("Clinic not found");
  if (session.user.role !== "MASTER") throw new Error("Forbidden");
  await db
    .delete(usersToClinicsTable)
    .where(
      and(
        eq(usersToClinicsTable.userId, id),
        eq(usersToClinicsTable.clinicId, session.user.clinic.id),
      ),
    );
  await db.delete(usersTable).where(eq(usersTable.id, id));
  revalidatePath("/users");
}
