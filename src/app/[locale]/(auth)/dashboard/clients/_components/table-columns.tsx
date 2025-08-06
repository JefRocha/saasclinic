"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency, formatCnpjCpf } from "@/helpers/format";
import ClientTableActions from "./table-actions";

// Definir o tipo Anamnese com base no que a action getAnamneses retorna
interface Client {
  id: number;
  razaoSocial: string | null;
  fantasia: string | null;
  telefone1: string | null;
  email: string | null;
  cpf: string | null;
  pessoa: string | null;
}

export const getClientsTableColumns = (
  onClientUpsertSuccess: (clientId?: string | number) => void,
  onRowClick: (clientId: string | number) => void
): ColumnDef<Client>[] => [
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
    accessorKey: "razaoSocial",
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
            <div className="w-full truncate">{row.original.razaoSocial}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{row.original.razaoSocial}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    accessorKey: "fantasia",
    size: 300,
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nome Fantasia
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full truncate">{row.original.fantasia}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{row.original.fantasia}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    accessorKey: "telefone1",
    size: 150,
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Telefone
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "email",
    size: 250,
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "cpf",
    size: 150,
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        CPF
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => formatCnpjCpf(row.original.cpf, row.original.pessoa),
  },
  {
    id: "actions",
    size: 80,
    cell: ({ row }) => (
      <ClientTableActions
        client={row.original}
        onClientUpsertSuccess={onClientUpsertSuccess}
        onRowClick={onRowClick}
      />
    ),
  },
];
