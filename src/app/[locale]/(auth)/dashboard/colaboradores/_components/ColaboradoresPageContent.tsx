import { ColaboradoresList } from "./colaboradores-list";
import { PageContent, PageContainer, PageHeader, PageHeaderContent, PageTitle, PageDescription } from "@/components/ui/page-container";
import { useTranslations } from "next-intl";

export function ColaboradoresPageContent() {
  const t = useTranslations("ColaboradoresPage");

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>{t("title")}</PageTitle>
          <PageDescription>{t("description")}</PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <ColaboradoresList />
      </PageContent>
    </PageContainer>
  );
}
