"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useTransition } from "react";
import type { SortingState } from "@tanstack/react-table";
import { useAuth } from "@clerk/nextjs";

import { DataTable as ClientsDataTable } from "./clients-data-table";
import { getClientsTableColumns } from "./table-columns";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchInput } from "./search-input";
import AddClientButton from "./add-client-button";

import { getClients } from "@/actions/get-clients";
import type { SearchClientsResult } from "@/actions/upsert-client/schema";

export const ClientsList = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const { orgId } = useAuth();

  const search = searchParams.get("search") || "";
  const page = Number(searchParams.get("page") || 1);
  const initialOrderBy = searchParams.get("orderBy") || "razaoSocial";
  const initialOrder = searchParams.get("order") || "asc";

  const [sorting, setSorting] = useState<SortingState>([
    { id: initialOrderBy, desc: initialOrder === "desc" },
  ]);
  const [highlightedClientId, setHighlightedClientId] = useState<string | number | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | number | null>(null);

  // useQuery para buscar e gerenciar os dados
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<SearchClientsResult, Error>({
    queryKey: ["clients", orgId, search, page, sorting[0].id, (sorting[0].desc ? "desc" : "asc")],
    queryFn: () => getClients({ search, page, orderBy: sorting[0].id, order: sorting[0].desc ? "desc" : "asc" }),
  });

  // Função para ser chamada em caso de sucesso (criação/edição/exclusão)
  const handleSuccess = (clientId?: string | number) => {
    queryClient.invalidateQueries({ queryKey: ["clients", orgId] });
    if (clientId) {
      setHighlightedClientId(clientId);
      setSelectedClientId(clientId); // Define o cliente selecionado também
    }
  };

  // Função para lidar com o clique na linha da tabela
  const handleRowClick = (clientId: string | number) => {
    setSelectedClientId(clientId);
  };

  // Limpa o destaque após alguns segundos
  useEffect(() => {
    if (highlightedClientId) {
      const timer = setTimeout(() => {
        setHighlightedClientId(null);
      }, 3000); // 3 segundos
      return () => clearTimeout(timer);
    }
  }, [highlightedClientId]);

  const columns = getClientsTableColumns(handleSuccess, handleRowClick);

  // Renderiza o Skeleton apenas no carregamento inicial
  if (isLoading && !data) return <Skeleton className="h-96 w-full" />;

  if (isError) {
    return (
      <div className="text-center p-6 text-destructive">
        {error.message || "Erro inesperado."}
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-4">
        <div className="flex-1">
          <SearchInput />
        </div>
        <AddClientButton onClientUpsertSuccess={handleSuccess} />
      </div>

      <ClientsDataTable
        columns={columns}
        data={data?.data ?? []}
        pagination={data?.pagination}
        emptyMessage="Nenhum cliente encontrado."
        onSortingChange={(updater) => {
          startTransition(() => {
            const newSortingState = typeof updater === 'function' ? updater(sorting) : updater;
            setSorting(newSortingState);

            const newOrderBy = newSortingState.length > 0 ? newSortingState[0].id : "razaoSocial";
            const newOrder = newSortingState.length > 0 && newSortingState[0].desc ? "desc" : "asc";

            const params = new URLSearchParams(searchParams.toString());
            params.set("orderBy", newOrderBy);
            params.set("order", newOrder);
            router.replace(`?${params.toString()}`);

            queryClient.invalidateQueries({ queryKey: ["clients", orgId] });
          });
        }}
        sorting={sorting}
        isFetching={isPending}
        highlightedClientId={highlightedClientId}
        selectedRowId={selectedClientId}
        onRowClick={handleRowClick}
      />
    </>
  );
};


