'use client';

import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { ptBR } from 'date-fns/locale';
import {
  addDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
} from 'date-fns';
import { DateRange } from 'react-day-picker';
import { useTranslations } from 'next-intl';

import { cn } from '@/libs/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Preset {
  label: string;
  range: DateRange;
}

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  dateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
}

export function DateRangePicker({
  className,
  dateRange,
  setDateRange,
}: DateRangePickerProps) {
  const t = useTranslations('DateRangePicker');
  const [isOpen, setIsOpen] = React.useState(false);
  const [localDateRange, setLocalDateRange] = React.useState<DateRange | undefined>(dateRange);

  React.useEffect(() => {
    setLocalDateRange(dateRange);
  }, [dateRange, isOpen]);

  const handleApply = () => {
    setDateRange(localDateRange);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setLocalDateRange(dateRange); // Reverte para o valor original
    setIsOpen(false);
  };

  const presets: Preset[] = [
    {
      label: t('today'),
      range: { from: startOfDay(new Date()), to: endOfDay(new Date()) },
    },
    {
      label: t('yesterday'),
      range: {
        from: startOfDay(subDays(new Date(), 1)),
        to: endOfDay(subDays(new Date(), 1)),
      },
    },
    {
      label: t('this_week'),
      range: { from: startOfWeek(new Date()), to: endOfWeek(new Date()) },
    },
    {
      label: t('this_month'),
      range: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) },
    },
    {
      label: t('this_year'),
      range: { from: startOfYear(new Date()), to: endOfYear(new Date()) },
    },
  ];

  const handlePresetClick = (preset: Preset) => {
    setDateRange(preset.range);
    setLocalDateRange(preset.range);
    setIsOpen(false);
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !dateRange && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "dd MMM yyyy", { locale: ptBR })} -{' '}
                  {format(dateRange.to, "dd MMM yyyy", { locale: ptBR })}
                </>
              ) : (
                format(dateRange.from, "dd MMM yyyy", { locale: ptBR })
              )
            ) : (
              <span>{t('pick_a_date')}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex w-auto flex-col space-y-2 p-2" align="start">
          <div className="flex items-center justify-center">
            <div className="grid grid-cols-5 gap-2">
              {presets.map((preset, index) => (
                <Button
                  key={index}
                  variant={isSameDay(preset.range.from, dateRange?.from ?? new Date(0)) && isSameDay(preset.range.to, dateRange?.to ?? new Date(0)) ? 'default' : 'ghost'}
                  onClick={() => handlePresetClick(preset)}
                  size="sm"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="rounded-md border">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={localDateRange?.from}
              selected={localDateRange}
              onSelect={setLocalDateRange}
              numberOfMonths={2}
              locale={ptBR}
            />
          </div>
           <div className="flex items-center justify-end space-x-2 pt-2">
            <Button variant="ghost" onClick={handleCancel}>{t('cancel')}</Button>
            <Button onClick={handleApply}>{t('apply')}</Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}