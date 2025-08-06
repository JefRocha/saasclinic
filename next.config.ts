import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  // A presença desta função `webpack` força o Next.js a usar o compilador Webpack mais antigo,
  // que é compatível com o `@clerk/nextjs`. O novo compilador Rust (padrão no Next 15+)
  // tem problemas em propagar o contexto de autenticação para as Server Actions.
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push(
        /^@opentelemetry\/instrumentation.*$/,
      );
    } else {
      // No lado do cliente, ignore o módulo 'fs'
      config.resolve.fallback = {
        fs: false,
      };
    }
    return config;
  },
};

// Exportar sem withClerk
export default withNextIntl(nextConfig);
