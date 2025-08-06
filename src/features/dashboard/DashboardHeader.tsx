'use client';

import { OrganizationSwitcher, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { AdminOrgSwitcher } from '@/components/AdminOrgSwitcher';
import { testAuthAction } from '@/actions/test-auth';

import { ActiveLink } from '@/components/ActiveLink';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { WeatherClock } from '@/components/WeatherClock';
import { ToggleMenuButton } from '@/components/ToggleMenuButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/templates/Logo';
import { getI18nPath } from '@/utils/Helpers';

export const DashboardHeader = (props: {
  menu: (
    | {
        href: string;
        label: string;
        icon?: React.ReactNode;
      }
    | {
        label: string;
        icon?: React.ReactNode;
        subItems: { href: string; label: string }[];
      }
  )[];
}) => {
  const locale = useLocale();
  const { user } = useUser();
  const isSuper  = user?.publicMetadata?.role === 'super_admin';

  return (
    <div className="w-full flex max justify-between items-center shadow-2xl bg-sidebar px-[30px]">
      <div className="flex items-center">
        <Link href="/dashboard" className="max-sm:hidden">
          <Logo />
        </Link>

        <svg
          className="size-8 stroke-muted-foreground max-sm:hidden"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" />
          <path d="M17 5 7 19" />
        </svg>

        {isSuper && (
          <OrganizationSwitcher
            organizationProfileMode="navigation"
            organizationProfileUrl={getI18nPath(
              '/dashboard/organization-profile',
              locale,
            )}
            afterCreateOrganizationUrl="/dashboard"
            hidePersonal
            skipInvitationScreen
            appearance={{
              elements: {
                organizationSwitcherTrigger: 'max-w-28 sm:max-w-52 text-foreground',
                organizationPreviewMainIdentifier: { color: 'var(--foreground-header)', __css: { color: 'var(--foreground-header) !important' } },
              },
              variables: {
                colorText: 'var(--foreground-header)',
              },
            }}
          />
        )}
        
        <nav className="ml-3 max-lg:hidden">
          <ul className="flex flex-row items-center gap-x-3 text-lg font-medium [&_a:hover]:opacity-100 [&_a]:opacity-75">
            {props.menu.map(item => (
              <li key={item.label}>
                {'href' in item && (
                  <ActiveLink href={item.href}>{item.label}</ActiveLink>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div>
        <ul className="flex items-center gap-x-1.5 [&_li[data-fade]:hover]:opacity-100 [&_li[data-fade]]:opacity-60">
          <li data-fade>
            <div className="lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <ToggleMenuButton />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {props.menu.map(item => (
                    'href' in item ? (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href}>{item.label}</Link>
                      </DropdownMenuItem>
                    ) : (
                      item.subItems.map(subItem => (
                        <DropdownMenuItem key={subItem.href} asChild>
                          <Link href={subItem.href}>{subItem.label}</Link>
                        </DropdownMenuItem>
                      ))
                    )
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </li>

          {/* PRO: Dark mode toggle button */}

                    
                  <button
        onClick={async () => {
          const result = await testAuthAction();
          console.log('Resultado da testAuthAction no cliente:', result);
        }}
        style={{ padding: '10px', margin: '20px', backgroundColor: 'lightblue', cursor: 'pointer' }}
      >
        Testar Autenticação
      </button>


          <li data-fade>
            <AdminOrgSwitcher />
          </li>

          {/* PRO: Dark mode toggle button */}
          <li data-fade>
            <ThemeSwitcher />
          </li>

          <li data-fade>
            <WeatherClock />
          </li>

          <li data-fade>
            <LocaleSwitcher />
          </li>

          <li>
            <Separator orientation="vertical" className="h-4" />
          </li>

          <li>
            <UserButton
              userProfileMode="navigation"
              userProfileUrl="/dashboard/user-profile"
              appearance={{
                elements: {
                  rootBox: 'px-2 py-1.5',
                },
              }}
            />
          </li>
        </ul>
      </div>
    </div>
  );
};
