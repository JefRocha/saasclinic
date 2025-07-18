import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

import createIntlMiddleware from 'next-intl/middleware';

import { AllLocales, AppConfig } from './utils/AppConfig';

const intlMiddleware = createIntlMiddleware({
  locales: AllLocales,
  localePrefix: AppConfig.localePrefix,
  defaultLocale: AppConfig.defaultLocale,
});

// Rotas que *não* devem ser protegidas pelo Clerk
const isPublicRoute = createRouteMatcher([
  '/',
  '/:locale',
  '/sign-in(.*)',
  '/:locale/sign-in(.*)',
  '/sign-up(.*)',
  '/:locale/sign-up(.*)',
  // Adicione outras rotas públicas aqui, se houver
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    // Protege todas as rotas que não são públicas
    await auth.protect();
  }

  // Em seguida, executa o middleware do next-intl
  return intlMiddleware(req);
});

export const config = {
  matcher: ['/((?!.+\.[\w]+$|_next|monitoring).*)', '/', '/(api|trpc)(.*)'],
};