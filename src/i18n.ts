import { notFound } from 'next/navigation';
import { getRequestConfig, type RequestConfig } from 'next-intl/server';

import { AppConfig } from '@/utils/AppConfig';

// -----------------------------------------------------------------------------
// Configuração de i18n para Server Components
// -----------------------------------------------------------------------------
export default getRequestConfig(async ({ locale }): Promise<RequestConfig> => {
  // 1) Fallback para o idioma padrão se vier undefined
  const effectiveLocale = locale ?? 'pt-BR';

  // 2) Valida o locale recebido
  if (!AppConfig.locales.includes(effectiveLocale)) {
    notFound(); // gera 404 para idiomas não suportados
  }

  // 3) Retorna o objeto exigido pelo tipo RequestConfig
  return {
    locale: effectiveLocale,
    messages: (await import(`./locales/${effectiveLocale}.json`)).default,
    timeZone: 'America/Sao_Paulo',
  };
});
