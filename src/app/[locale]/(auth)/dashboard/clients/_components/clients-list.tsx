"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { DataTable } from "@/components/ui/data-table";
import { clientsTableColumns } from "./table-columns";
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

  useEffect(() => {
  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/clients?search=${search}&page=${page}&order=${order}&orderBy=${orderBy}`,
        { cache: "no-store" }
      );
      console.log("Resposta bruta:", res); // 👈 novo
      if (!res.ok) throw new Error("Erro ao buscar clientes.");
      const json: SearchClientsResult = await res.json();
      console.log("Dados recebidos:", json); // 👈 novo
      setData(json);
    } catch (err: any) {
      console.error("Erro ao buscar clientes:", err); // 👈 novo
      setError(err.message || "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  fetchClients();
}, [search, page, order, orderBy]);

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
      <AddClientButton />
    </div>

    {error ? (
      <div className="text-center p-6 text-destructive">
        {error}
      </div>
    ) : (
      <DataTable
        columns={clientsTableColumns}
        data={data?.data ?? []}
        pagination={data?.pagination}
        emptyMessage="Nenhum cliente encontrado."
      />
    )}
  </>
)};
