'use server';

import { auth } from "@clerk/nextjs/server";

export async function testAuthAction() {
  const { userId, orgId } = auth();
  return { userId, orgId };
}
