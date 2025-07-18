// src/app/[locale]/(auth)/layout.tsx



import { AppConfig } from '@/utils/AppConfig';

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // 2️⃣ defina o locale do Clerk
  // let clerkLocale = enUS;
  // if (locale === 'fr') {
  //   clerkLocale = frFR;
  // }
  
  // 3️⃣ monte as URLs de sign-in / sign-up / dashboard
  let signInUrl = '/sign-in';
  let signUpUrl = '/sign-up';
  let dashboardUrl = '/dashboard';
  let afterSignOutUrl = '/';

  if (locale !== AppConfig.defaultLocale) {
    signInUrl = `/${locale}${signInUrl}`;
    signUpUrl = `/${locale}${signUpUrl}`;
    dashboardUrl = `/${locale}${dashboardUrl}`;
    afterSignOutUrl = `/${locale}${afterSignOutUrl}`;
  }

  // 4️⃣ retorne o ClerkProvider (server component)
  return (
    <>
      {children}
    </>
  );
}
