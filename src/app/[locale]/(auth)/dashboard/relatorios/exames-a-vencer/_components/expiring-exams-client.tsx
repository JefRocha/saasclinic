'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ReportDataTable } from './report-data-table';
import { useQuery } from '@tanstack/react-query';
import { columns } from './columns';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { SearchInput } from '@/components/ui/search-input';
import { endOfMonth } from 'date-fns/endOfMonth';
import { startOfMonth } from 'date-fns/startOfMonth';
import { type DateRange } from 'react-day-picker';

// A interface agora espera a action como uma prop
interface ExpiringExamsClientProps {
  getExpiringExamsAction: (params: { search?: string, startDate?: Date; endDate?: Date; }) => Promise<any>;
}

export function ExpiringExamsClient({ getExpiringExamsAction }: ExpiringExamsClientProps) {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const { data: exams, isLoading } = useQuery({
    queryKey: ['expiringExams', search, date],
    queryFn: async () => {
      if (!date?.from || !date?.to) return [];
      // Chama a action recebida via props
      const result = await getExpiringExamsAction({ search, startDate: date.from, endDate: date.to });
      // A safe-action retorna { data: [...] }, então extraímos o array
      return result.data ?? [];
    },
    enabled: !!date?.from && !!date?.to,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full">
          <SearchInput />
          <DateRangePicker dateRange={date} setDateRange={setDate} />
        </div>
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