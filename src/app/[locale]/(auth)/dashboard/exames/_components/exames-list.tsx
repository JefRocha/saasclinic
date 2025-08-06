"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useTransition } from "react";
import type { SortingState } from "@tanstack/react-table";
import { useAuth } from "@clerk/nextjs";

import { DataTable as ExamesDataTable } from "./exames-data-table";
import { getExamesTableColumns } from "./table-columns";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchInput } from "./search-input";
import AddExameButton from "./add-exame-button";

import { getExames } from "@/actions/get-exames";
import type { SearchExamesResult } from "@/actions/upsert-exame/schema";

export const ExamesList = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const { orgId } = useAuth();

  const search = searchParams.get("search") || "";
  const page = Number(searchParams.get("page") || 1);
  const initialOrderBy = searchParams.get("orderBy") || "descricao";
  const initialOrder = searchParams.get("order") || "asc";

  const [sorting, setSorting] = useState<SortingState>([
    { id: initialOrderBy, desc: initialOrder === "desc" },
  ]);
  const [highlightedExameId, setHighlightedExameId] = useState<string | number | null>(null);
  const [selectedExameId, setSelectedExameId] = useState<string | number | null>(null);

  // useQuery para buscar e gerenciar os dados
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<SearchExamesResult, Error>({
    queryKey: ["exames", orgId, search, page, sorting[0].id, (sorting[0].desc ? "desc" : "asc")],
    queryFn: () => getExames({ search, page, orderBy: sorting[0].id, order: sorting[0].desc ? "desc" : "asc" }),
  });

  // Função para ser chamada em caso de sucesso (criação/edição/exclusão)
  const handleSuccess = (exameId?: string | number) => {
    queryClient.invalidateQueries({ queryKey: ["exames", orgId] });
    if (exameId) {
      setHighlightedExameId(exameId);
      setSelectedExameId(exameId);
    }
  };

  // Função para lidar com o clique na linha da tabela
  const handleRowClick = (exameId: string | number) => {
    setSelectedExameId(exameId);
  };

  // Limpa o destaque após alguns segundos
  useEffect(() => {
    if (highlightedExameId) {
      const timer = setTimeout(() => {
        setHighlightedExameId(null);
      }, 3000); // 3 segundos
      return () => clearTimeout(timer);
    }
  }, [highlightedExameId]);

  const columns = getExamesTableColumns(handleSuccess, handleRowClick);

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
        <AddExameButton onExameUpsertSuccess={handleSuccess} />
      </div>

      <ExamesDataTable
        columns={columns}
        data={data?.data ?? []}
        pagination={data?.pagination}
        emptyMessage="Nenhum exame encontrado."
        onSortingChange={(updater) => {
          startTransition(() => {
            const newSortingState = typeof updater === 'function' ? updater(sorting) : updater;
            setSorting(newSortingState);

            const newOrderBy = newSortingState.length > 0 ? newSortingState[0].id : "descricao";
            const newOrder = newSortingState.length > 0 && newSortingState[0].desc ? "desc" : "asc";

            const params = new URLSearchParams(searchParams.toString());
            params.set("orderBy", newOrderBy);
            params.set("order", newOrder);
            router.replace(`?${params.toString()}`);

            queryClient.invalidateQueries({ queryKey: ["exames", orgId] });
          });
        }}
        sorting={sorting}
        isFetching={isPending}
        highlightedClientId={highlightedExameId}
        selectedRowId={selectedExameId}
        onRowClick={handleRowClick}
      />
    </>
  );
};