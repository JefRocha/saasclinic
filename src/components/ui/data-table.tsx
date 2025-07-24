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
};

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  onSortingChange,
  sorting,
  isFetching = false, // Adicionado
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
    <div className={cn("rounded-md border bg-card", { "opacity-50 transition-opacity duration-300": isFetching })}>
      <Table>
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
                    className="odd:bg-muted/50"
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} className="py-1 px-4 text-sm whitespace-nowrap">
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
