import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';

import { withPolicy } from '@/lib/withPolicy';
import { Action }      from '@/lib/ability';

import {
  PageContainer,
  PageHeader,
  PageHeaderContent,
  PageTitle,
  PageDescription,
  PageContent,
} from '@/components/ui/page-container';

import ClientsPageContent from './_components/ClientsPageContent';

/* ---------- Server Component ---------- */
async function ClientsPage() {
  const { userId, orgId } = await auth();
  const user = await currentUser();

  if (!userId || !user)  redirect('/authentication');
  if (!orgId)            redirect('/clinic-form');

  return (
      
      <PageContent>
        <ClientsPageContent />
      </PageContent>
  );
}

/* ---------- Proteção RBAC/CASL ---------- */
export default withPolicy(
  ClientsPage,
  (ab) => ab.can(Action.Read, 'Client'),   // viewer/editor/admin podem ler
);
