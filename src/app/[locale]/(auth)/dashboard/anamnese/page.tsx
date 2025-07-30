import { AnamneseList } from "./_components/anamnese-list";
import {
  PageContainer,
  PageHeader,
  PageHeaderContent,
  PageTitle,
  PageDescription,
  PageContent,
} from '@/components/ui/page-container';

export default function AnamnesePage() {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Anamneses</PageTitle>
          <PageDescription>Gerencie as anamneses dos seus pacientes.</PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <AnamneseList />
      </PageContent>
    </PageContainer>
  );
}
