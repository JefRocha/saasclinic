"use client";

import { useTranslations } from "next-intl";

import { PageContainer, PageHeader, PageHeaderContent, PageTitle, PageDescription, PageContent } from "@/components/ui/page-container";

import { MedicosList } from "./medicos-list";

export function MedicosPageContent() {
  const t = useTranslations("MedicosPage");

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>{t("title")}</PageTitle>
          <PageDescription>{t("description")}</PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <MedicosList />
      </PageContent>
    </PageContainer>
  );
}