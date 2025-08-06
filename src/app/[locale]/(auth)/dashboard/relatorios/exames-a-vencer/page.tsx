import {
  PageContainer,
  PageHeader,
  PageHeaderContent,
  PageTitle,
  PageDescription,
  PageContent,
} from '@/components/ui/page-container';
import { ExpiringExamsClient } from './_components/expiring-exams-client';

export default function ExpiringExamsPage() {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Relatório de Exames a Vencer</PageTitle>
          <PageDescription>
            Visualize os exames ocupacionais que estão próximos do vencimento.
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <ExpiringExamsClient data={[]} />
      </PageContent>
    </PageContainer>
  );
}
