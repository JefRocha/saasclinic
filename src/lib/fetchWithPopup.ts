// src/lib/fetchWithPopup.ts
'use client';
import { useState } from 'react';
import { useModal } from '@/components/PermissionModal';

export function useFetchWithPopup() {
  const openModal = useModal();
  const [loading, setLoading] = useState(false);

  async function secureFetch(
    input: RequestInfo,
    init?: RequestInit,
  ): Promise<Response | null> {
    setLoading(true);
    try {
      const res = await fetch(input, init);

      if (res.status === 403) {
        await openModal('Você não tem permissão para essa ação.');
        return null;
      }
      return res;
    } catch {
      await openModal('Erro inesperado. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { fetch: secureFetch, loading };
}
