"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useTransition } from "react";
import type { SortingState } from "@tanstack/react-table";
import { useAuth } from "@clerk/nextjs";

import { DataTable as MedicosDataTable } from "./medicos-data-table";
import { getMedicosTableColumns } from "./table-columns";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchInput } from "./search-input";
import AddMedicoButton from "./add-medico-button";

import { getMedicos } from "@/actions/get-medicos";
import type { SearchMedicosResult } from "@/actions/upsert-medico/schema";

export const MedicosList = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const { orgId } = useAuth();

  const search = searchParams.get("search") || "";
  const page = Number(searchParams.get("page") || 1);
  const initialOrderBy = searchParams.get("orderBy") || "nome";
  const initialOrder = searchParams.get("order") || "asc";

  const [sorting, setSorting] = useState<SortingState>([
    { id: initialOrderBy, desc: initialOrder === "desc" },
  ]);
  const [highlightedMedicoId, setHighlightedMedicoId] = useState<string | number | null>(null);
  const [selectedMedicoId, setSelectedMedicoId] = useState<string | number | null>(null);

  // useQuery para buscar e gerenciar os dados
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<SearchMedicosResult, Error>({
    queryKey: ["medicos", orgId, search, page, sorting[0].id, (sorting[0].desc ? "desc" : "asc")],
    queryFn: () => getMedicos({ search, page, orderBy: sorting[0].id, order: sorting[0].desc ? "desc" : "asc" }),
  });

  // Função para ser chamada em caso de sucesso (criação/edição/exclusão)
  const handleSuccess = (medicoId?: string | number) => {
    queryClient.invalidateQueries({ queryKey: ["medicos"] });
    if (medicoId) {
      setHighlightedMedicoId(medicoId);
      setSelectedMedicoId(medicoId);
    }
  };

  // Função para lidar com o clique na linha da tabela
  const handleRowClick = (medicoId: string | number) => {
    setSelectedMedicoId(medicoId);
  };

  // Limpa o destaque após alguns segundos
  useEffect(() => {
    if (highlightedMedicoId) {
      const timer = setTimeout(() => {
        setHighlightedMedicoId(null);
      }, 3000); // 3 segundos
      return () => clearTimeout(timer);
    }
  }, [highlightedMedicoId]);

  const columns = getMedicosTableColumns(handleSuccess, handleRowClick);

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
        <AddMedicoButton onMedicoUpsertSuccess={handleSuccess} />
      </div>

      <MedicosDataTable
        columns={columns}
        data={data?.data ?? []}
        pagination={data?.pagination}
        emptyMessage="Nenhum médico encontrado."
        onSortingChange={(updater) => {
          startTransition(() => {
            const newSortingState = typeof updater === 'function' ? updater(sorting) : updater;
            setSorting(newSortingState);

            const newOrderBy = newSortingState.length > 0 ? newSortingState[0].id : "nome";
            const newOrder = newSortingState.length > 0 && newSortingState[0].desc ? "desc" : "asc";

            const params = new URLSearchParams(searchParams.toString());
            params.set("orderBy", newOrderBy);
            params.set("order", newOrder);
            router.replace(`?${params.toString()}`);

            queryClient.invalidateQueries({ queryKey: ["medicos", orgId] });
          });
        }}
        sorting={sorting}
        isFetching={isPending}
        highlightedClientId={highlightedMedicoId}
        selectedRowId={selectedMedicoId}
        onRowClick={handleRowClick}
      />
    </>
  );
};