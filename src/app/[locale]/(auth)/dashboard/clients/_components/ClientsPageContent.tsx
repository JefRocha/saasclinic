// src/app/[locale]/dashboard/clients/ClientsPageContent.tsx
'use client';

import { ClientsList } from "./clients-list";
import {
  PageContainer,
  PageHeader,
  PageHeaderContent,
  PageTitle,
  PageDescription,
  PageContent,
} from "@/components/ui/page-container";

export function ClientsPageContent() {
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
}
