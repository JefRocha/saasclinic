"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatCurrency } from "@/helpers/format";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
import AnamneseTableActions from "./table-actions";
import { Anamnese } from "@/actions/get-anamneses/schema"; // Importar o tipo Anamnese completo

export const getAnamnesesTableColumns = (
  onAnamneseUpsertSuccess: (anamneseId?: string | number) => void,
  onRowClick: (anamneseId: string | number) => void,
  onEditAnamnese: (anamnese: Anamnese) => void // Adicionar esta prop
): ColumnDef<Anamnese>[] => [
  {
    accessorKey: "id",
    size: 50,
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
      const d = row.original.data;
      // Garantir que datas vindas como string ISO ou Date sejam exibidas no dia correto em local time
      return d ? dayjs(d).utc().format("DD/MM/YYYY") : "";
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
        Razão Social
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full truncate">
              {row.original.clienteRazaoSocial}
            </div>
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
    size: 250,
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Razão Social
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full truncate">
              {row.original.colaboradorNome}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{row.original.colaboradorNome}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
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
    accessorKey: "total",
    size: 100,
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Total
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const formattedValue = formatCurrency(row.original.total);
      const [currencySymbol, value] = formattedValue.split(/\s(?=\d)/);
      return (
        <div className="flex justify-between w-full">
          <span className="text-left">{currencySymbol}</span>
          <span className="text-right">{value}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    size: 50,
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
