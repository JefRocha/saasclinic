import { setRequestLocale } from 'next-intl/server';
import { Sidebar } from '@/components/Sidebar';
import { DashboardHeader } from '@/features/dashboard/DashboardHeader';

export default async function AuthLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  // Menu vazio temporário para o DashboardHeader
  const headerMenu = [];

  return (
    <div className="flex flex-col h-screen">
      <DashboardHeader menu={headerMenu} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {props.children}
        </main>
      </div>
    </div>
  );
}
