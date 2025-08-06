import "@/styles/global.css";

import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
import type { Metadata } from "next";
import { getMessages } from "next-intl/server";
import { Geist, Geist_Mono } from "next/font/google";

import ClientIntlProvider from "@/components/ClientIntlProvider";
import { PermissionModalProvider } from "@/components/PermissionModal";
import ReactQueryProvider from "@/components/providers/react-query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AppConfig } from "@/utils/AppConfig";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  icons: [
    {
      rel: "apple-touch-icon",
      url: "/apple-touch-icon.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      url: "/favicon-32x32.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      url: "/favicon-16x16.png",
    },
    {
      rel: "icon",
      url: "/favicon.ico",
    },
  ],
};

export function generateStaticParams() {
  return AppConfig.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = await params;

  if (!AppConfig.locales.includes(locale)) {
    // your 404 logic
  }

  const messages = await getMessages({ locale });
  const timeZone = "America/Sao_Paulo";

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider localization={ptBR}>
            <ClientIntlProvider
              locale={locale}
              messages={messages}
              timeZone={timeZone}
            >
              <ReactQueryProvider>
                <PermissionModalProvider>{children}</PermissionModalProvider>
              </ReactQueryProvider>
            </ClientIntlProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}