import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { PageContainer } from "@/components/ui/page-container";
import { auth } from "@/lib/auth";

import { AddUserButton } from "./_components/add-user-button";
import { UsersList } from "./_components/users-list";

export default async function UsersPage() {
  const session = await auth.api.getSession({ headers: headers() });
  if (!session?.user || session.user.role !== "MASTER") {
    redirect("/dashboard");
  }
  return (
    <PageContainer title="Usuários">
      <div className="mb-4 flex justify-between">
        <h1 className="text-2xl font-bold">Usuários da Clínica</h1>
        <AddUserButton />
      </div>
      <UsersList />
    </PageContainer>
  );
}
