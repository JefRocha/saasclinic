"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/helpers/format";
import AnamneseTableActions from "./table-actions";
import { Anamnese } from "@/actions/get-anamneses/schema"; // Importar o tipo Anamnese completo

export const getAnamnesesTableColumns = (
  onAnamneseUpsertSuccess: (anamneseId?: string | number) => void,
  onRowClick: (anamneseId: string | number) => void,
  onEditAnamnese: (anamnese: Anamnese) => void // Adicionar esta prop
): ColumnDef<Anamnese>[] => [
  {
    accessorKey: "id",
    size: 80,
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        ID
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "clienteRazaoSocial",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Cliente
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "colaboradorNome",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Colaborador
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "tipo",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Tipo
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "cargo",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Cargo
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <AnamneseTableActions
        anamnese={row.original}
        onAnamneseUpsertSuccess={onAnamneseUpsertSuccess}
        onRowClick={onRowClick}
        onEditAnamnese={onEditAnamnese} // Passar a nova prop
      />
    ),
  },
];
