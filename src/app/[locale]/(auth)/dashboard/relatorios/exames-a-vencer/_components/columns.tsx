'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { type ExpiringExam } from '@/actions/get-expiring-exams/schema';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const columns: ColumnDef<ExpiringExam>[] = [
  {
    accessorKey: 'clienteNome',
    header: 'Cliente',
  },
  {
    accessorKey: 'colaboradorNome',
    header: 'Colaborador',
  },
  {
    accessorKey: 'exameNome',
    header: 'Exame',
  },
  {
    accessorKey: 'dataRealizacao',
    header: 'Data Realização',
    cell: ({ row }) => {
      const date = row.getValue('dataRealizacao') as Date;
      return format(date, 'dd/MM/yyyy');
    },
  },
  {
    accessorKey: 'vencimento',
    header: 'Vencimento',
    cell: ({ row }) => {
      const date = row.getValue('vencimento') as Date;
      return format(date, 'dd/MM/yyyy');
    },
  },
  {
    accessorKey: 'telefone',
    header: 'Telefone',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const exam = row.original;
      return (
        <Button asChild variant="outline" size="sm">
          <Link href={`/dashboard/colaboradores/${exam.colaboradorId}`}>
            Ver Colaborador
          </Link>
        </Button>
      );
    },
  },
];