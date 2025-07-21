"use client";

import { useAction } from "next-safe-action/hooks";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { searchClients } from "@/actions/upsert-client";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";

import AddClientButton from "./add-client-button";
import { SearchInput } from "./search-input";
import { clientsTableColumns } from "./table-columns";

export const ClientsList = () => {
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const page = Number(searchParams.get("page")) || 1;
  const order = searchParams.get("order");
  const orderBy = searchParams.get("orderBy");

  const { execute, result, status } = useAction(searchClients, {
    onError: (error) => {
      console.error("Erro ao buscar clientes:", error);
    },
  });

  useEffect(() => {
    execute({
      search: search || undefined,
      page,
      order: order || undefined,
      orderBy: orderBy || undefined,
    });
  }, [search, page, order, orderBy, execute]);

  const isLoading = status === "executing";
  const data = result?.data;
  const error = result?.serverError;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-destructive bg-destructive/10 p-8 text-center">
        <h2 className="text-lg font-semibold text-destructive">
          Acesso não autorizado
        </h2>
        <p className="text-sm text-muted-foreground">
          Ocorreu um erro ao carregar os clientes. Verifique suas permissões e tente novamente.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <>
      <div className="mb-4 flex w-full items-center gap-4">
        <div className="min-w-0 flex-1">
          <SearchInput />
        </div>
        <AddClientButton />
      </div>
      <DataTable
        columns={clientsTableColumns}
        data={data?.data || []}
        pagination={data?.pagination}
      />
    </>
  );
};