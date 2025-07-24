"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useTransition } from "react";
import type { SortingState } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";
import { getClientsTableColumns } from "./table-columns";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchInput } from "./search-input";
import AddClientButton from "./add-client-button";

import type { SearchClientsResult } from "@/types/clients";

// Função que busca os dados da API
const fetchClients = async (
  search: string,
  page: number,
  order: string,
  orderBy: string,
): Promise<SearchClientsResult> => {
  const url = `/api/clients?search=${search}&page=${page}&order=${order}&orderBy=${orderBy}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Erro ao buscar clientes.");
  }
  return res.json();
};

export const ClientsList = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const search = searchParams.get("search") || "";
  const page = Number(searchParams.get("page") || 1);
  const initialOrderBy = searchParams.get("orderBy") || "razaoSocial";
  const initialOrder = searchParams.get("order") || "asc";

  const [sorting, setSorting] = useState<SortingState>([
    { id: initialOrderBy, desc: initialOrder === "desc" },
  ]);

  // useQuery para buscar e gerenciar os dados
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<SearchClientsResult, Error>({
    queryKey: ["clients", search, page, sorting[0].id, (sorting[0].desc ? "desc" : "asc")],
    queryFn: () => fetchClients(search, page, sorting[0].desc ? "desc" : "asc", sorting[0].id),
  });

  // Função para ser chamada em caso de sucesso (criação/edição/exclusão)
  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["clients"] });
  };

  const columns = getClientsTableColumns(handleSuccess);

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

      <DataTable
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

            queryClient.invalidateQueries({ queryKey: ["clients"] });
          });
        }}
        sorting={sorting}
        isFetching={isPending} // Passa o isPending para o DataTable
      />
    </>
  );
};


