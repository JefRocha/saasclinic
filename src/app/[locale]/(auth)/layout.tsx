// src/app/(auth)/layout.tsx
import { ClerkProvider }      from '@clerk/nextjs';
import { setRequestLocale }   from 'next-intl/server';
import { routing }            from '@/libs/I18nRouting';
import { ClerkLocalizations } from '@/utils/AppConfig';

import { AbilityProvider }         from '@/components/AbilityProvider';
import { PermissionModalProvider } from '@/components/PermissionModal';

/* ⬇️ NÃO é async */
export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = await  params;
  setRequestLocale(locale);

  const clerkLocale =
    ClerkLocalizations.supportedLocales[locale] ??
    ClerkLocalizations.defaultLocale;

  let signInUrl       = '/sign-in';
  let signUpUrl       = '/sign-up';
  let dashboardUrl    = '/dashboard';
  let afterSignOutUrl = '/';

  if (locale !== routing.defaultLocale) {
    signInUrl       = `/${locale}${signInUrl}`;
    signUpUrl       = `/${locale}${signUpUrl}`;
    dashboardUrl    = `/${locale}${dashboardUrl}`;
    afterSignOutUrl = `/${locale}${afterSignOutUrl}`;
  }

  return (
    <ClerkProvider
      localization={clerkLocale}
      signInUrl={signInUrl}
      signUpUrl={signUpUrl}
      signInFallbackRedirectUrl={dashboardUrl}
      signUpFallbackRedirectUrl={dashboardUrl}
      afterSignOutUrl={afterSignOutUrl}
      appearance={{ cssLayerName: 'clerk' }}
    >
      <AbilityProvider>
        <PermissionModalProvider>
          {children}
        </PermissionModalProvider>
      </AbilityProvider>
    </ClerkProvider>
  );
}
