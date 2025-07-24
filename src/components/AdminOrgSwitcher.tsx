// src/components/AdminOrgSwitcher.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue, FormControl } from '@/components/ui/select';
import { useUser, useClerk } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';

type Org = { id: string; name: string };

export function AdminOrgSwitcher() {
  const { user }   = useUser();
  const { setActive } = useClerk();

  const isSuper = user?.publicMetadata?.role === 'super_admin';

  /* 1. carrega todas as organizações usando sua API */
  const locale = useLocale();
  const { data: orgs = [] } = useQuery({
    queryKey: ['all-orgs', locale],
    queryFn : async () => {
      const res  = await fetch(`/${locale}/api/organizations`);
      const json = await res.json();

      // ① se já for array, usa direto; ② senão extrai do objeto
      if (Array.isArray(json)) return json;
      if (Array.isArray(json.data)) return json.data;
      if (Array.isArray(json.organizations)) return json.organizations;
      return [];                // fallback seguro
    },
    enabled: isSuper,
  });

  /* 2. pega o orgId atual da sessão Clerk */
  const [activeOrg, setActiveOrg] = useState<string | undefined>();
  useEffect(() => {
    // @ts-ignore Clerk types
    const currentOrg = user?.organizationMemberships?.[0]?.organization?.id;
    setActiveOrg(currentOrg);
  }, [user]);

  if (!isSuper) return null;            // não mostra p/ outros papéis

  async function handleChange(id: string) {
    await setActive({ organization: id });  // Clerk troca org ativa
    setActiveOrg(id);
    location.reload();                      // recarrega página/dashboard
  }

  return (
    <Select value={activeOrg} onValueChange={handleChange}>
      {/* REMOVA <FormControl> */}
      <SelectTrigger className="w-56">
        <SelectValue placeholder="Escolha a clínica" />
      </SelectTrigger>
      {/* REMOVA </FormControl> */}

      <SelectContent>
        {orgs.map(o => (
          <SelectItem key={o.id} value={o.id}>
            {o.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

}
