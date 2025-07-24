"use client";

import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();

  const search = searchParams.get("search") || "";
  const page = Number(searchParams.get("page") || 1);
  const order = searchParams.get("order") || "";
  const orderBy = searchParams.get("orderBy") || "";

  // useQuery para buscar e gerenciar os dados
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<SearchClientsResult, Error>({
    queryKey: ["clients", search, page, order, orderBy],
    queryFn: () => fetchClients(search, page, order, orderBy),
    // staleTime: 1000 * 60 * 5, // Opcional: 5 minutos de cache
  });

  // Função para ser chamada em caso de sucesso (criação/edição/exclusão)
  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["clients"] });
  };

  const columns = getClientsTableColumns(handleSuccess);

  if (isLoading) return <Skeleton className="h-96 w-full" />;

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
      />
    </>
  );
};
