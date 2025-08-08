import {
  PageContainer,
  PageHeader,
  PageHeaderContent,
  PageTitle,
  PageDescription,
  PageContent,
} from '@/components/ui/page-container';
import { ExpiringExamsClient } from './_components/expiring-exams-client';
import { getExpiringExams } from '@/actions/get-expiring-exams';

export default function ExpiringExamsPage() {
  // A action é encapsulada em uma nova função marcada com 'use server'
  // para que possa ser passada com segurança para o componente cliente.
  async function getExpiringExamsAction(params: { search?: string, startDate?: Date; endDate?: Date; }) {
    'use server';
    return getExpiringExams(params);
  }

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
        <ExpiringExamsClient getExpiringExamsAction={getExpiringExamsAction} />
      </PageContent>
    </PageContainer>
  );
}