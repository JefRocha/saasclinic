"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useTransition } from "react";
import type { SortingState } from "@tanstack/react-table";
import { useAuth } from "@clerk/nextjs";

import { DataTable as ColaboradoresDataTable } from "./colaboradores-data-table";
import { getColaboradoresTableColumns } from "./table-columns";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchInput } from "./search-input";
import AddColaboradorButton from "./add-colaborador-button";

import { getColaboradores } from "@/actions/get-colaboradores";
import type { SearchColaboradoresResult } from "@/actions/upsert-colaborador/schema";

export const ColaboradoresList = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const { orgId } = useAuth();

  const search = searchParams.get("search") || "";
  const page = Number(searchParams.get("page") || 1);
  const initialOrderBy = searchParams.get("orderBy") || "name";
  const initialOrder = searchParams.get("order") || "asc";

  const [sorting, setSorting] = useState<SortingState>([
    { id: initialOrderBy, desc: initialOrder === "desc" },
  ]);
  const [highlightedColaboradorId, setHighlightedColaboradorId] = useState<string | number | null>(null);
  const [selectedColaboradorId, setSelectedColaboradorId] = useState<string | number | null>(null);

  // useQuery para buscar e gerenciar os dados
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<SearchColaboradoresResult, Error>({
    queryKey: ["colaboradores", orgId, search, page, sorting[0].id, (sorting[0].desc ? "desc" : "asc")],
    queryFn: () => getColaboradores({ search, page, orderBy: sorting[0].id, order: sorting[0].desc ? "desc" : "asc" }),
  });

  // Função para ser chamada em caso de sucesso (criação/edição/exclusão)
  const handleSuccess = (colaboradorId?: string | number) => {
    queryClient.invalidateQueries({ queryKey: ["colaboradores", orgId] });
    if (colaboradorId) {
      setHighlightedColaboradorId(colaboradorId);
      setSelectedColaboradorId(colaboradorId); // Define o colaborador selecionado também
    }
  };

  // Função para lidar com o clique na linha da tabela
  const handleRowClick = (colaboradorId: string | number) => {
    setSelectedColaboradorId(colaboradorId);
  };

  // Limpa o destaque após alguns segundos
  useEffect(() => {
    if (highlightedColaboradorId) {
      const timer = setTimeout(() => {
        setHighlightedColaboradorId(null);
      }, 3000); // 3 segundos
      return () => clearTimeout(timer);
    }
  }, [highlightedColaboradorId]);

  const columns = getColaboradoresTableColumns(handleSuccess, handleRowClick);

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
        <AddColaboradorButton onColaboradorUpsertSuccess={handleSuccess} />
      </div>

      <ColaboradoresDataTable
        columns={columns}
        data={data?.data ?? []}
        pagination={data?.pagination}
        emptyMessage="Nenhum colaborador encontrado."
        onSortingChange={(updater) => {
          startTransition(() => {
            const newSortingState = typeof updater === 'function' ? updater(sorting) : updater;
            setSorting(newSortingState);

            const newOrderBy = newSortingState.length > 0 ? newSortingState[0].id : "name";
            const newOrder = newSortingState.length > 0 && newSortingState[0].desc ? "desc" : "asc";

            const params = new URLSearchParams(searchParams.toString());
            params.set("orderBy", newOrderBy);
            params.set("order", newOrder);
            router.replace(`?${params.toString()}`);

            queryClient.invalidateQueries({ queryKey: ["colaboradores", orgId] });
          });
        }}
        sorting={sorting}
        isFetching={isPending}
        highlightedClientId={highlightedColaboradorId}
        selectedRowId={selectedColaboradorId}
        onRowClick={handleRowClick}
      />
    </>
  );
};
