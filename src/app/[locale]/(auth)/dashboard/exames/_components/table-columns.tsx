"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { upsertExameSchema } from "@/actions/upsert-exame/schema";

import ExamesTableActions from "./table-actions";

type Exame = typeof upsertExameSchema._type;

export const getExamesTableColumns = (
  onExameUpsertSuccess: (exameId?: string | number) => void,
  onRowClick: (exameId: string | number) => void
): ColumnDef<Exame>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Código
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "descricao",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Descrição
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "valor",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Valor
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const valor = parseFloat(row.original.valor as string);
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(valor);
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ExamesTableActions exame={row.original} onExameUpsertSuccess={onExameUpsertSuccess} onRowClick={onRowClick} />,
  },
];