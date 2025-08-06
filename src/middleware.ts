import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";

import { AppConfig } from "@/utils/AppConfig";

// 1. Crie o middleware de internacionalização
const intlMiddleware = createMiddleware({
  locales: AppConfig.locales,
  defaultLocale: AppConfig.defaultLocale,
  localePrefix: AppConfig.localePrefix,
});

// 2. Defina as rotas que devem ser protegidas
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

// 3. Exporte o middleware do Clerk, que agora envolve a lógica
export default clerkMiddleware((auth, req) => {
  // Se a rota for protegida, aplique a autenticação do Clerk
  if (isProtectedRoute(req)) {
    auth.protect();
  }

  // Sempre, no final, passe a requisição para o middleware de internacionalização
  return intlMiddleware(req);
});

export const config = {
  // O matcher precisa capturar todas as rotas para que a lógica acima funcione corretamente
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};