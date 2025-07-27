'use client';

import { useState } from "react";
import { useTranslations } from "next-intl";

import {
  PageContainer,
  PageHeader,
  PageHeaderContent,
  PageTitle,
  PageDescription,
  PageContent,
} from "@/components/ui/page-container";
import { Button } from "@/components/ui/button";
import { ClientsSelect } from "./clients-select";
import { ExamesCliList } from "./exames-cli-list";

export function ExamesPorClientePageContent() {
  const t = useTranslations("ExamesPorClientePage");
  const [selectedClientId, setSelectedClientId] = useState<string | number | null>(null);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>{t("title")}</PageTitle>
          <PageDescription>{t("description")}</PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <div className="mb-4 flex items-center justify-between">
          <ClientsSelect
            selectedClientId={selectedClientId}
            onClientChange={setSelectedClientId}
          />
          <div className="flex items-center gap-4">
            <Button className="bg-green-500 hover:bg-green-600 text-white">Exportar p/ Excel</Button>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">Imprimir</Button>
          </div>
        </div>
        <ExamesCliList clientId={selectedClientId} />
      </PageContent>
    </PageContainer>
  );
}