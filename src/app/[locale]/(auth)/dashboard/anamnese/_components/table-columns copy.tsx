"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency } from "@/helpers/format";
import AnamneseTableActions from "./table-actions";
import { Anamnese } from "@/actions/get-anamneses/schema"; // Importar o tipo Anamnese completo

export const getAnamnesesTableColumns = (
  onAnamneseUpsertSuccess: (anamneseId?: string | number) => void,
  onRowClick: (anamneseId: string | number) => void,
  onEditAnamnese: (anamnese: Anamnese) => void // Adicionar esta prop
): ColumnDef<Anamnese>[] => [
  
  {
    accessorKey: "data",
    size: 80,
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Data
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("data"));
      const formattedDate = new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
      return <div>{formattedDate}</div>;
    },
  },
  {
    accessorKey: "clienteRazaoSocial",
    size: 300,
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Empresa
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full truncate">{row.original.clienteRazaoSocial}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{row.original.clienteRazaoSocial}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    accessorKey: "colaboradorNome",
    size: 200,
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Colaborador
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full truncate">{row.original.colaboradorNome}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{row.original.colaboradorNome}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    accessorKey: "valor",
    size: 100,
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
      return formatCurrency(row.original.valor);
    },
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
