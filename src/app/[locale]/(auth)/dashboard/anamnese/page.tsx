import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';

import { withPolicy } from '@/lib/withPolicy';
import { Action }      from '@/lib/ability';

import {
  PageContent,
} from '@/components/ui/page-container';

import { AnamnesePageContent } from './_components/AnamnesePageContent';

/* ---------- Server Component ---------- */
async function AnamnesePage() {
  const { userId, orgId } = await auth();
  const user = await currentUser();

  if (!userId || !user)  redirect('/authentication');
  if (!orgId)            redirect('/clinic-form');

  return (
      <PageContent>
        <AnamnesePageContent />
      </PageContent>
  );
}

/* ---------- Proteção RBAC/CASL ---------- */
export default withPolicy(
  AnamnesePage,
  (ab) => ab.can(Action.Read, 'Anamnese'),
);