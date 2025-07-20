import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";

import { ClientsList } from "./_components/clients-list";

const ClientsPage = async () => {
  const { userId, orgId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect("/authentication");
  }

  if (!orgId) {
    redirect("/clinic-form");
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Clientes</PageTitle>
          <PageDescription>Gerencie os clientes da sua clínica</PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <ClientsList />
      </PageContent>
    </PageContainer>
  );
};

export default ClientsPage;