"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { DataTable } from "@/components/ui/data-table";
import { getClientsTableColumns } from "./table-columns";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchInput } from "./search-input";
import AddClientButton from "./add-client-button";

import type { SearchClientsResult } from "@/types/clients";


export const ClientsList = () => {
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const page = Number(searchParams.get("page") || 1);
  const order = searchParams.get("order") || "";
  const orderBy = searchParams.get("orderBy") || "";

  const [data, setData] = useState<SearchClientsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    console.log("fetchClients is being executed.");
    console.log("Current search params:", { search, page, order, orderBy });
    setLoading(true);
    setError(null);
    try {
      const url = `/api/clients?search=${search}&page=${page}&order=${order}&orderBy=${orderBy}`;
      console.log("Fetching from URL:", url);
      const res = await fetch(
        url,
        { cache: "no-store" }
      );
      console.log("Resposta bruta:", res);
      if (!res.ok) throw new Error("Erro ao buscar clientes.");
      const json: SearchClientsResult = await res.json();
      console.log("Dados recebidos:", json);
      setData(json);
    } catch (err: any) {
      console.error("Erro ao buscar clientes:", err);
      setError(err.message || "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }, [search, page, order, orderBy]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const columns = getClientsTableColumns(fetchClients);

  if (loading) return <Skeleton className="h-96 w-full" />;

  if (error) {
    return (
      <div className="text-center p-6 text-destructive">
        {error}
      </div>
    );
  }


  return (
  <>
    <div className="mb-4 flex items-center gap-4">
      <div className="flex-1">
        <SearchInput />
      </div>
      <AddClientButton onClientUpsertSuccess={fetchClients} />
    </div>

    {error ? (
      <div className="text-center p-6 text-destructive">
        {error}
      </div>
    ) : (
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        pagination={data?.pagination}
        emptyMessage="Nenhum cliente encontrado."
      />
    )}
  </>
)};