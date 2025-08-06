'use client';

import { useState } from 'react';
import { ReportDataTable } from './report-data-table';
import { useQuery } from '@tanstack/react-query';
import { getExpiringExams } from '@/actions/get-expiring-exams';
import { type ExpiringExam } from '@/actions/get-expiring-exams/schema';
import { columns } from './columns';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { endOfMonth } from 'date-fns/endOfMonth';
import { startOfMonth } from 'date-fns/startOfMonth';

import { type DateRange } from 'react-day-picker';

interface ExpiringExamsClientProps {
  data: ExpiringExam[];
}

export function ExpiringExamsClient({ data }: ExpiringExamsClientProps) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const { data: exams, isLoading } = useQuery({
    queryKey: ['expiringExams', date],
    queryFn: () =>
      getExpiringExams({
        startDate: date?.from,
        endDate: date?.to,
      }),
    enabled: !!date,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Exames a Vencer</h2>
        <DateRangePicker date={date} setDate={setDate} />
      </div>
      <ReportDataTable
        columns={columns}
        data={exams?.data ?? []}
        isLoading={isLoading}
        emptyMessage="Nenhum exame vencendo no período selecionado."
      />
    </div>
  );
}
