"use client";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import { getClinicUsers } from "@/actions/users";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";

import { AddUserButton } from "./add-user-button";
import { SearchInput } from "./search-input";
import { TableActions } from "./table-actions";
import { columns } from "./table-columns";

export async function deleteUserApi(id: string) {
  const res = await fetch("/api/clinic-users", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("Erro ao excluir usuário");
}

export async function upsertUserApi(data: any) {
  const res = await fetch("/api/clinic-users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao salvar usuário");
}

export function UsersList() {
  const searchParams = useSearchParams();
  // (No momento, a API não suporta busca/paginação, mas já deixamos preparado)
  // const search = searchParams.get("search");
  // const page = Number(searchParams.get("page")) || 1;
  // const order = searchParams.get("order");
  // const orderBy = searchParams.get("orderBy");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/clinic-users");
      if (!res.ok) throw new Error("Erro ao buscar usuários");
      return res.json();
    },
  });

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <>
      <div className="mb-4 flex w-full items-center gap-4">
        <div className="min-w-0 flex-1">
          <SearchInput />
        </div>
        <AddUserButton />
      </div>
      <DataTable
        columns={columns}
        data={data || []}
        // pagination={data?.pagination} // Ativar quando a API suportar
        isLoading={isLoading}
        emptyMessage="Nenhum usuário encontrado."
        components={{
          TableActions: (props: any) => (
            <TableActions
              {...props}
              onDelete={async (id: string) => {
                await deleteUserApi(id);
                refetch();
              }}
              onEdit={async (data: any) => {
                await upsertUserApi(data);
                refetch();
              }}
            />
          ),
        }}
      />
    </>
  );
}
