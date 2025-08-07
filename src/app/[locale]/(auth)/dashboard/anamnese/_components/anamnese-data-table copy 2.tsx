"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  emptyMessage?: string;
  onSortingChange?: (sorting: SortingState) => void;
  sorting?: SortingState;
  isFetching?: boolean;
  highlightedClientId?: string | number | null;
  selectedRowId?: string | number | null;
  onRowClick?: (id: string | number) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data: propData,
  emptyMessage,
  onSortingChange,
  sorting,
  isFetching,
  highlightedClientId,
  selectedRowId,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const t = useTranslations("DataTable");

  const actualData = (propData as any)?.data || propData;

  const table = useReactTable({
    data: actualData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: onSortingChange,
    state: {
      sorting: sorting,
    },
  });

  if (isFetching) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                onClick={() => onRowClick && onRowClick(row.original.id as string | number)}
                className={
                  selectedRowId === (row.original as any).id
                    ? "bg-blue-100 dark:bg-blue-900"
                    : ""
                }
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {emptyMessage || t("no_results")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
