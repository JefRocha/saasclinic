'use client';

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { useTranslations } from "next-intl";

import { getClientsForSelect } from "@/actions/get-clients-for-select";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface ClientsSelectProps {
  selectedClientId: string | number | null;
  onClientChange: (clientId: string | number | null) => void;
}

export function ClientsSelect({
  selectedClientId,
  onClientChange,
}: ClientsSelectProps) {
  const t = useTranslations("ExamesPorCliente");
  const { orgId } = useAuth();

  const { data: clients, isLoading } = useQuery({
    queryKey: ["clientsForSelect", orgId],
    queryFn: () => getClientsForSelect({}),
    enabled: !!orgId, // Só busca se tiver orgId
  });

  const clientItems = clients?.data?.map(client => ({ id: client.id, name: client.name || '' })) || [];

  return (
    <SearchableSelect
      items={clientItems}
      selectedValue={selectedClientId}
      onValueChange={onClientChange}
      placeholder={t("select_client_placeholder")}
      searchPlaceholder={t("search_client_placeholder")}
      noResultsText={t("no_client_found")}
      selectAllText={t("select_all_clients")}
      isLoading={isLoading}
      className="w-full md:w-[600px]"
    />
  );
}
