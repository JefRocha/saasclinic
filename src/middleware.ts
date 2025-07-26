import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";

import { AppConfig } from "@/utils/AppConfig";

const intlMiddleware = createMiddleware({
  locales: AppConfig.locales,
  defaultLocale: AppConfig.defaultLocale,
  localePrefix: AppConfig.localePrefix,
});

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/(pt-BR|en|fr)/dashboard(.*)", // Inclui todos os idiomas configurados
  "/(pt-BR|en|fr)/dashboard/colaboradores(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth.protect();
  }

  return intlMiddleware(req);
});

export const config = {
  //matcher: ["/((?!.*\..*|_next|_vercel|monitoring|api|trpc).*)"],
  //matcher: '/((?!_next|_vercel|monitoring|.*\\..*).*)',
  matcher: ["/((?!.*\\..*|_next).*)"],
};