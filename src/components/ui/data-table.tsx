'use client';

import type { ColumnDef, SortingState } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { cn } from "@/libs/utils";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination?: { // Adicionado a prop pagination
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onSortingChange: (sorting: SortingState) => void; // Adicionado
  sorting: SortingState; // Adicionado
  isFetching?: boolean; // Adicionado
  highlightedClientId?: string | number | null; // Adicionado
  selectedRowId?: string | number | null; // Adicionado
  onRowClick?: (id: string | number) => void; // Adicionado
};

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  onSortingChange,
  sorting,
  isFetching = false,
  highlightedClientId = null,
  selectedRowId = null,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), // Adicionado
    onSortingChange: onSortingChange, // Adicionado
    state: {
      sorting: sorting, // Adicionado
    },
  });
  const t = useTranslations('DataTable');

  return (
    <div className={cn("rounded-md border bg-card overflow-x-auto", { "opacity-50 transition-opacity duration-300": isFetching })}>
      <Table className="min-w-full">
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length
            ? (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    onClick={() => onRowClick && row.original && row.original.id && onRowClick(row.original.id)}
                    className={cn(
                      "hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors duration-200",
                      row.original && row.original.id === highlightedClientId && "bg-blue-100 dark:bg-blue-900/20",
                      row.original && row.original.id === selectedRowId && "bg-gray-200 dark:bg-gray-700",
                      !(row.original && (row.original.id === highlightedClientId || row.original.id === selectedRowId)) && "odd:bg-muted/50"
                    )}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} className="py-1 px-4 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )
            : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    {t('no_results')}
                  </TableCell>
                </TableRow>
              )}
        </TableBody>
      </Table>
    </div>
  );
}
