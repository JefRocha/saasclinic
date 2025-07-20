import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import type { JSX } from "react";

export async function withAuth<P extends object>(
  Component: (props: P) => JSX.Element,
  props: P,
): Promise<JSX.Element> {
  const { userId, orgId } = await auth(); // 🛠️ ESSA LINHA É ESSENCIAL
  const user = await currentUser();

  if (!userId || !user) {
    redirect("/authentication");
  }

  if (!orgId) {
    redirect("/clinic-form");
  }

  return <Component {...props} />;
}
