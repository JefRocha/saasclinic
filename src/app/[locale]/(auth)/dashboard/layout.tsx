"use client"

import { useTranslations } from "next-intl";
import React, { useState, useEffect, useTransition, createContext, useContext } from "react";

// ✅ novos componentes da Complex‑Sidebar
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarEntry,
  SidebarSubmenu,
  SidebarCollapseButton,
} from "@/components/ui/complex-sidebar";

import { DashboardHeader } from "@/features/dashboard/DashboardHeader";
import { FullScreenLoader } from "@/components/ui/full-screen-loader";

import {
  Home,
  Users,
  Settings,
  FileText,
  Stethoscope,
} from "lucide-react";

// Create the context
interface LoadingContextType {
  isRoutePending: boolean;
  startRouteTransition: (callback: () => void) => void;
}
export const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// Custom hook to use the loading context
export function useRouteLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useRouteLoading must be used within a LoadingProvider');
  }
  return context;
}

export default function DashboardLayout({
  children,
  params: rawParams,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = React.use(rawParams);
  const t = useTranslations("DashboardLayout");
  const [isPending, startTransition] = useTransition();

  // Provide the context value
  const loadingContextValue = React.useMemo(() => ({
    isRoutePending: isPending,
    startRouteTransition: startTransition,
  }), [isPending, startTransition]);

  /* --------------------------- estrutura do menu --------------------------- */
  const menu: (
    | {
        href: string;
        label: string;
        icon: React.ReactNode;
      }
    | {
        label: string;
        icon: React.ReactNode;
        subItems: { href: string; label: string; icon: React.ReactNode }[];
      }
  )[] = [
    {
      href: "/dashboard",
      label: t("home"),
      icon: <Home className="size-4" />,
    },
    {
      label: t("movimento"),
      icon: <FileText className="size-4" />,
      subItems: [
        {
          href: "/dashboard/anamnese",
          label: t("anamnese"),
          icon: <FileText className="size-4" />,
        },
      ],
    },
    {
      label: t("reports"),
      icon: <FileText className="size-4" />,
      subItems: [
        {
          href: "/dashboard/relatorios/exames-a-vencer",
          label: t("expiring_exams"),
          icon: <FileText className="size-4" />,
        },
      ],
    },
    {
      label: t("registrations"),
      icon: <Users className="size-4" />,
      subItems: [
        {
          href: "/dashboard/clients",
          label: t("clients"),
          icon: <Users className="size-4" />,
        },
        {
          href: "/dashboard/exames",
          label: t("exams"),
          icon: <FileText className="size-4" />,
        },
        {
          href: "/dashboard/medicos",
          label: t("doctors"),
          icon: <Stethoscope className="size-4" />,
        },
        {
          href: "/dashboard/colaboradores",
          label: t("colaboradores"),
          icon: <Users className="size-4" />,
        },
        {
          href: "/dashboard/exames-por-cliente",
          label: t("exams_by_client"),
          icon: <FileText className="size-4" />,
        },
      ],
    },
    {
      label: t("financial"),
      icon: <FileText className="size-4" />,
      subItems: [
        {
          href: "/dashboard/financeiro/contas-a-pagar",
          label: t("accounts_payable"),
          icon: <FileText className="size-4" />,
        },
        {
          href: "/dashboard/financeiro/contas-a-receber",
          label: t("accounts_receivable"),
          icon: <FileText className="size-4" />,
        },
      ],
    },
    {
      href: "/dashboard/organization-profile",
      label: t("settings"),
      icon: <Settings className="size-4" />,
    },
  ];

  /* ----------------------------------------------------------------------- */
  return (
    <div className="flex h-screen flex-col bg-sidebar">
      {/* Header fixo */}
      <header 
  className="sticky top-0 z-10 h-[--header-height] bg-sidebar shadow-lg"
  style={{ "--header-height": "80px" } as React.CSSProperties}
>
  <div className="flex items-center px-3 py-4">
    <DashboardHeader menu={menu} className="w-full" />
  </div>
</header>

      {/* Layout principal */}
      <SidebarProvider>
        <LoadingContext.Provider value={loadingContextValue}> {/* Wrap with provider */}
          <div className="flex flex-1 overflow-hidden  ">
            <Sidebar variant="inset" collapsible>
              <SidebarContent>
                <div className="flex justify-end py-2 pr-1">
                  <SidebarCollapseButton />
                </div>

                <SidebarMenu>
                  {menu.map((item) =>
                    "href" in item ? (
                      <SidebarEntry key={item.href} href={item.href} icon={() => item.icon as any}>
                        {item.label}
                      </SidebarEntry>
                    ) : (
                      <SidebarSubmenu key={item.label} id={item.label} label={item.label} icon={() => item.icon as any}>
                        {item.subItems.map((sub) => (
                          <SidebarEntry key={sub.href} href={sub.href} icon={() => sub.icon as any}>
                            {sub.label}
                          </SidebarEntry>
                        ))}
                      </SidebarSubmenu>
                    ),
                  )}
                </SidebarMenu>
              </SidebarContent>
            </Sidebar>

            {/* Conteúdo principal */}
            <main className="flex-1 overflow-y-auto bg-muted flex flex-col px-6 py-6">{children}</main>
          </div>
        </LoadingContext.Provider>
      </SidebarProvider>
      <FullScreenLoader isLoading={isPending} /> {/* Still use local isPending here */}
    </div>
  );
}

export const dynamic = "force-dynamic";