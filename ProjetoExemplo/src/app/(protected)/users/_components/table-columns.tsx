import { ColumnDef } from "@tanstack/react-table";

import { TableActions } from "./table-actions";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => row.original.name,
  },
  {
    accessorKey: "email",
    header: "E-mail",
    cell: ({ row }) => row.original.email,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <TableActions user={row.original} />,
    enableSorting: false,
  },
];
