'use client';

import React, { useMemo } from 'react';
import { useUser, useOrganization } from '@clerk/nextjs';

type BadgeProps = {
  requiredRoles?: string[];          // ex: ['admin', 'manager']
  requiredPermissions?: string[];    // ex: ['canEdit', 'canDelete']
  showDetails?: boolean;             // lista permissões atuais
};

function normalize(v: any): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(x => String(x));
  return [String(v)];
}

function hasAccess(
  role: string | null,
  perms: string[],
  requiredRoles?: string[],
  requiredPermissions?: string[]
) {
  const roleOK = !requiredRoles?.length || (role && requiredRoles.includes(role));
  const permsOK = !requiredPermissions?.length || requiredPermissions.every(p => perms.includes(p));
  return roleOK && permsOK;
}

export default function AccessGuardBadge({
  requiredRoles,
  requiredPermissions,
  showDetails = false,
}: BadgeProps) {
  const { user, isLoaded: userLoaded } = useUser();
  const { organization, isLoaded: orgLoaded } = useOrganization();

  const { role, permissions } = useMemo(() => {
    // 1) Tentar via organização atual
    const orgRole = (organization as any)?.membership?.role as string | undefined;
    const orgPerms = normalize((organization as any)?.membership?.permissions);

    // 2) Fallback: metadata do usuário (defina ao autenticar/adm)
    const metaRole = (user?.publicMetadata as any)?.role as string | undefined;
    const metaPerms = normalize((user?.publicMetadata as any)?.permissions);

    return {
      role: orgRole ?? metaRole ?? null,
      permissions: (orgPerms.length ? orgPerms : metaPerms) as string[],
    };
  }, [organization, user]);

  const ready = userLoaded && orgLoaded;
  const allowed = ready && hasAccess(role, permissions, requiredRoles, requiredPermissions);

  const color = !ready ? 'bg-gray-400' : allowed ? 'bg-emerald-500' : 'bg-rose-500';
  const label = !ready ? 'Verificando…' : allowed ? 'Permitido' : 'Negado';

  return (
    <div className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs border border-black/10 bg-white/70 backdrop-blur">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="font-medium">Acesso</span>
      <span className="opacity-70">
        • {label} {role ? `(${role})` : ''}
      </span>
      {showDetails && permissions?.length > 0 && (
        <span className="opacity-60 hidden sm:inline">
          • Perms: {permissions.join(', ')}
        </span>
      )}
    </div>
  );
}

/** Wrapper opcional para proteger UI por role/permissões */
export function AccessGuard({
  requiredRoles,
  requiredPermissions,
  children,
}: {
  requiredRoles?: string[];
  requiredPermissions?: string[];
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const { organization } = useOrganization();

  const role =
    ((organization as any)?.membership?.role as string | undefined) ??
    ((user?.publicMetadata as any)?.role as string | undefined) ??
    null;

  const permissions =
    (normalize((organization as any)?.membership?.permissions).length
      ? normalize((organization as any)?.membership?.permissions)
      : normalize((user?.publicMetadata as any)?.permissions));

  const allowed = hasAccess(role, permissions, requiredRoles, requiredPermissions);
  if (!allowed) return null;
  return <>{children}</>;
}
