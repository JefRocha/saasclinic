// src/components/AdminOrgSwitcher.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue, FormControl } from '@/components/ui/select';
import { useUser, useClerk, useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';

type Org = { id: string; name: string };

export function AdminOrgSwitcher() {
  const { user }   = useUser();
  const { setActive } = useClerk();
  const { orgId: currentOrgId } = useAuth(); // Obtém o orgId da sessão ativa

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
  const [activeOrg, setActiveOrg] = useState<string | undefined>(currentOrgId ?? undefined);
  useEffect(() => {
    setActiveOrg(currentOrgId ?? undefined);
  }, [currentOrgId]);

  if (!isSuper) return null;            // não mostra p/ outros papéis

  async function handleChange(id: string) {
    try {
      await setActive({ organization: id });  // Clerk troca org ativa
      location.reload();                      // recarrega página/dashboard
    } catch (error) {
      console.error("AdminOrgSwitcher - Error setting active organization:", error);
      // Opcional: Adicionar um toast de erro aqui para feedback ao usuário
    }
  }

  return (
    <Select value={activeOrg} onValueChange={handleChange}>
      {/* REMOVA <FormControl> */}
      <SelectTrigger className="w-56 bg-blue-50 border-blue-300 text-blue-800 font-semibold shadow-sm hover:bg-blue-100 focus:ring-blue-500 focus:border-blue-500">
        <SelectValue placeholder="Escolha a clínica" />
      </SelectTrigger>
      {/* REMOVA </FormControl> */}

      <SelectContent>
        {orgs.map(o => (
          <SelectItem key={o.id} value={o.id}>
            {o.nome}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

}
