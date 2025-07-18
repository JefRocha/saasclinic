import { OrganizationList } from '@clerk/nextjs';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,                              // 👈 é Promise
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;     // ✅ aguarde primeiro

  const t = await getTranslations({ locale, namespace: 'Dashboard' });
   return {
     title: t('title'),
   };
 }

const OrganizationSelectionPage = () => (
  <div className="flex min-h-screen items-center justify-center">
    <OrganizationList
      afterSelectOrganizationUrl="/dashboard"
      afterCreateOrganizationUrl="/dashboard"
      hidePersonal
      skipInvitationScreen
    />
  </div>
);

export const dynamic = 'force-dynamic';

export default OrganizationSelectionPage;
