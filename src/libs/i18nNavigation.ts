import { createNavigation } from 'next-intl/navigation';
import { AllLocales, AppConfig } from '@/utils/AppConfig';

export const {
  Link,              // <Link locale="en" href="/dashboard" />
  usePathname,
  useRouter,
  redirect,          // redirect('/dashboard', 'pt-BR')
  getPathname,       // server-side helper
} = createNavigation({
  locales: AllLocales,          // ['pt-BR', 'en', 'es']
  defaultLocale: 'pt-BR',       // ou AppConfig.defaultLocale
  localePrefix: AppConfig.localePrefix,   // 'as-needed' | 'always' | 'never'
});
