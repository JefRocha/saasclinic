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
import { ValidationErrorsModalProvider } from "@/components/ui/validation-errors-modal";

export default function ClientsPageContent() {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Clientes</PageTitle>
          <PageDescription>Gerencie os clientes da sua clínica</PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <ValidationErrorsModalProvider>
          <ClientsList />
        </ValidationErrorsModalProvider>
      </PageContent>
    </PageContainer>
  );
}
