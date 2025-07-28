'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useTransition } from "react";
import type { SortingState } from "@tanstack/react-table";
import { useAuth } from "@clerk/nextjs";

import { DataTable as ExamesCliDataTable } from "./exames-cli-data-table";
import { getExamesCliTableColumns } from "./exames-cli-table-columns";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchInput } from "@/components/ui/search-input";

import { getExamesCli } from "@/actions/get-exames-cli";
import type { SearchExamesCliResult } from "@/actions/get-exames-cli/schema";

interface ExamesCliListProps {
  clientId: string | number | null;
  onDataLoaded: (data: any[]) => void; // Nova prop
}

export const ExamesCliList = ({ clientId, onDataLoaded }: ExamesCliListProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const { orgId } = useAuth();

  const search = searchParams.get("search") || "";
  const page = Number(searchParams.get("page") || 1);
  const initialOrderBy = searchParams.get("orderBy") || "id";
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
  } = useQuery<SearchExamesCliResult, Error>({
    queryKey: ["examesCli", orgId, clientId, search, page, sorting[0].id, (sorting[0].desc ? "desc" : "asc")],
    queryFn: () => getExamesCli({ clientId, search, page, orderBy: sorting[0].id, order: sorting[0].desc ? "desc" : "asc" }),
    enabled: !!clientId, // Só busca se um cliente estiver selecionado
  });

  // Chamar onDataLoaded quando os dados forem carregados ou alterados
  useEffect(() => {
    onDataLoaded(data?.data?.data || []);
  }, [data, onDataLoaded]);

  const columns = getExamesCliTableColumns(); // Não precisa de callbacks aqui, pois é só exibição

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
      </div>

      <ExamesCliDataTable
        columns={columns}
        data={data?.data ?? []}
        pagination={data?.pagination}
        emptyMessage="Nenhum exame encontrado para este cliente."
        onSortingChange={(updater) => {
          startTransition(() => {
            const newSortingState = typeof updater === 'function' ? updater(sorting) : updater;
            setSorting(newSortingState);

            const newOrderBy = newSortingState.length > 0 ? newSortingState[0].id : "id";
            const newOrder = newSortingState.length > 0 && newSortingState[0].desc ? "desc" : "asc";

            const params = new URLSearchParams(searchParams.toString());
            params.set("orderBy", newOrderBy);
            params.set("order", newOrder);
            router.replace(`?${params.toString()}`);

            queryClient.invalidateQueries({ queryKey: ["examesCli", orgId, clientId] });
          });
        }}
        sorting={sorting}
        isFetching={isPending}
      />
    </>
  );
};