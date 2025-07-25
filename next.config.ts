import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push(
        /^@opentelemetry\/instrumentation.*$/,
      );
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
