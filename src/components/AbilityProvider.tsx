'use client';

import { createContext, useContext, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { buildAbility, AppAbility } from '@/lib/ability';

const AbilityCtx = createContext<AppAbility | null>(null);

export function AbilityProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();

  const ability = useMemo(
    () => (isLoaded ? buildAbility(user?.publicMetadata?.role as string) : null),
    [isLoaded, user],
  );

  if (!ability) return null;              // opcional: spinner
  return <AbilityCtx.Provider value={ability}>{children}</AbilityCtx.Provider>;
}

export const useAbility = () => useContext(AbilityCtx)!;
