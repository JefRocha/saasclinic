import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { withPolicy } from '@/lib/withPolicy';

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";

import ClientsPageContent from "./_components/ClientsPageContent";

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
        <ClientsPageContent />
      </PageContent>
    </PageContainer>
  );
};

export default ClientsPageContent;


