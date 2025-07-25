"use client";

import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import React, { useState } from 'react';

import { SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarCollapseButton, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from '@/components/ui/complex-sidebar';
import { DashboardHeader } from '@/features/dashboard/DashboardHeader';


import { Home, Users, Settings, ChevronDown, ChevronUp, FileText, Stethoscope } from 'lucide-react';



export default function DashboardLayout(props: { children: React.ReactNode, params: { locale: string } }) {
  const t = useTranslations('DashboardLayout');
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

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
      href: '/dashboard',
      label: t('home'),
      icon: <Home className="size-4" />,
    },
    {
      label: t('registrations'),
      icon: <Users className="size-4" />,
      subItems: [
        {
          href: '/dashboard/clients',
          label: t('clients'),
          icon: <Users className="size-4" />,
        },
        {
          href: '/dashboard/exames',
          label: t('exams'),
          icon: <FileText className="size-4" />,
        },
        {
          href: '/dashboard/medicos',
          label: t('doctors'),
          icon: <Stethoscope className="size-4" />,
        },
      ],
    },
    {
      href: '/dashboard/organization-profile',
      label: t('settings'),
      icon: <Settings className="size-4" />,
    },
  ];

  return (
    <div className="flex h-screen flex-col">
      <header className="sticky top-0 z-10 bg-background shadow-lg">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-3 py-4">
          <DashboardHeader menu={menu} />
        </div>
      </header>

      <SidebarProvider>
        <div className="flex flex-1 overflow-hidden">
          <Sidebar collapsible="icon" className="top-[72px] h-[calc(100vh-72px)]">
            <SidebarContent>
              <div className="flex justify-end py-2 pr-1">
                <SidebarCollapseButton />
              </div>
              <SidebarMenu>
                {menu.map((item) => (
                  <SidebarMenuItem key={item.href || item.label}>
                    {item.href ? (
                      <SidebarMenuButton href={item.href}>
                        {item.icon}
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    ) : (
                      <>
                        <SidebarMenuButton onClick={() => setOpenSubmenu(openSubmenu === item.label ? null : item.label)}>
                          {item.icon}
                          <span>{item.label}</span>
                          {openSubmenu === item.label ? <ChevronUp className="ml-auto size-4" /> : <ChevronDown className="ml-auto size-4" />}
                        </SidebarMenuButton>
                        {openSubmenu === item.label && item.subItems && (
                          <SidebarMenuSub>
                            {item.subItems.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.href}>
                                <SidebarMenuSubButton href={subItem.href}>
                                  {subItem.icon}
                                  {subItem.label}
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        )}
                      </>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <main className="flex-1 overflow-y-auto bg-muted p-6">
            {props.children}
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}

export const dynamic = 'force-dynamic';
