'use client';

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { useTranslations } from "next-intl";

import { getClientsForSelect } from "@/actions/get-clients-for-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

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

  if (isLoading) {
    return <Skeleton className="h-10 w-[200px]" />;
  }

  return (
    <Select
      value={selectedClientId?.toString() || ""}
      onValueChange={(value) => onClientChange(value === "" ? null : value)}
    >
      <SelectTrigger className="w-full md:w-[600px] shadow-md border border-gray-400">
        <SelectValue placeholder={t("select_client_placeholder")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={null}>{t("select_all_clients")}</SelectItem>
        {clients?.data?.map((client) => (
          <SelectItem key={client.id} value={client.id.toString()}>
            {client.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}