'use server';

import { auth } from "@clerk/nextjs/server";

export async function testAuthAction() {
  const { userId, orgId } = auth();
  console.log('DEBUG TEST AUTH ACTION: userId =', userId);
  console.log('DEBUG TEST AUTH ACTION: orgId =', orgId);
  return { userId, orgId };
}
