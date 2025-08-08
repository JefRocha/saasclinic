'use client';

import * as React from 'react';
import { CalendarIcon, X } from 'lucide-react';
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
  isValid,
  differenceInDays,
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
  shortcut?: string;
}

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  dateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  maxDate?: Date;
  minDate?: Date;
  maxDays?: number;
  showClearButton?: boolean;
  showPresets?: boolean;
  customPresets?: Preset[];
  formatString?: string;
  onOpenChange?: (open: boolean) => void;
}

export function DateRangePicker({
  className,
  dateRange,
  setDateRange,
  placeholder,
  disabled = false,
  maxDate,
  minDate,
  maxDays,
  showClearButton = true,
  showPresets = true,
  customPresets,
  formatString = "dd MMM yyyy",
  onOpenChange,
  ...props
}: DateRangePickerProps) {
  const t = useTranslations('DateRangePicker');
  const [isOpen, setIsOpen] = React.useState(false);
  const [localDateRange, setLocalDateRange] = React.useState<DateRange | undefined>(dateRange);

  // Memoização dos presets para evitar recriação desnecessária
  const presets: Preset[] = React.useMemo(() => {
    if (customPresets) return customPresets;
    
    return [
      {
        label: t('today'),
        range: { from: startOfDay(new Date()), to: endOfDay(new Date()) },
        shortcut: 'T',
      },
      {
        label: t('yesterday'),
        range: {
          from: startOfDay(subDays(new Date(), 1)),
          to: endOfDay(subDays(new Date(), 1)),
        },
        shortcut: 'Y',
      },
      {
        label: t('last_7_days'),
        range: {
          from: startOfDay(subDays(new Date(), 6)),
          to: endOfDay(new Date()),
        },
        shortcut: '7',
      },
      {
        label: t('last_30_days'),
        range: {
          from: startOfDay(subDays(new Date(), 29)),
          to: endOfDay(new Date()),
        },
        shortcut: '30',
      },
      {
        label: t('this_week'),
        range: { from: startOfWeek(new Date()), to: endOfWeek(new Date()) },
        shortcut: 'W',
      },
      {
        label: t('this_month'),
        range: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) },
        shortcut: 'M',
      },
      {
        label: t('this_year'),
        range: { from: startOfYear(new Date()), to: endOfYear(new Date()) },
        shortcut: 'R',
      },
    ];
  }, [customPresets, t]);

  // Sincronização com props
  React.useEffect(() => {
    setLocalDateRange(dateRange);
  }, [dateRange]);

  // Callback para mudanças no estado do popover
  React.useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  // Validação de data range
  const isValidDateRange = React.useCallback((range: DateRange | undefined): boolean => {
    if (!range?.from || !range?.to) return true; // Range incompleto é válido
    
    if (!isValid(range.from) || !isValid(range.to)) return false;
    
    if (maxDays && differenceInDays(range.to, range.from) > maxDays) return false;
    
    if (minDate && range.from < minDate) return false;
    if (maxDate && range.to > maxDate) return false;
    
    return true;
  }, [maxDays, minDate, maxDate]);

  // Verifica se um preset está ativo
  const isPresetActive = React.useCallback((preset: Preset): boolean => {
    if (!dateRange?.from || !dateRange?.to) return false;
    return (
      isSameDay(preset.range.from, dateRange.from) &&
      isSameDay(preset.range.to, dateRange.to)
    );
  }, [dateRange]);

  const handleOpenChange = React.useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setLocalDateRange(dateRange); // Reset ao fechar
    }
  }, [dateRange]);

  const handleApply = React.useCallback(() => {
    if (isValidDateRange(localDateRange)) {
      setDateRange(localDateRange);
      setIsOpen(false);
    }
  }, [localDateRange, setDateRange, isValidDateRange]);

  const handleCancel = React.useCallback(() => {
    setLocalDateRange(dateRange);
    setIsOpen(false);
  }, [dateRange]);

  const handlePresetClick = React.useCallback((preset: Preset) => {
    if (isValidDateRange(preset.range)) {
      setDateRange(preset.range);
      setLocalDateRange(preset.range);
      setIsOpen(false);
    }
  }, [setDateRange, isValidDateRange]);

  const handleClear = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setDateRange(undefined);
    setLocalDateRange(undefined);
  }, [setDateRange]);

  const handleDateSelect = React.useCallback((range: DateRange | undefined) => {
    if (isValidDateRange(range)) {
      setLocalDateRange(range);
    }
  }, [isValidDateRange]);

  // Formatação do texto exibido
  const displayText = React.useMemo(() => {
    if (!dateRange?.from) {
      return placeholder || t('pick_a_date');
    }

    if (dateRange.to) {
      return `${format(dateRange.from, formatString, { locale: ptBR })} - ${format(
        dateRange.to,
        formatString,
        { locale: ptBR }
      )}`;
    }

    return format(dateRange.from, formatString, { locale: ptBR });
  }, [dateRange, placeholder, t, formatString]);

  // Suporte a atalhos de teclado
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
        return;
      }

      if (e.key === 'Enter') {
        handleApply();
        return;
      }

      // Atalhos para presets
      const preset = presets.find(p => p.shortcut?.toLowerCase() === e.key.toLowerCase());
      if (preset) {
        handlePresetClick(preset);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleCancel, handleApply, handlePresetClick, presets]);

  const hasValidRange = dateRange?.from && dateRange?.to;
  const canApply = localDateRange && isValidDateRange(localDateRange);

  return (
    <div className={cn('grid gap-2', className)} {...props}>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !dateRange && 'text-muted-foreground',
              'relative group'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            <span className="truncate">{displayText}</span>
            
            {showClearButton && hasValidRange && !disabled && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleClear}
                tabIndex={-1}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          className="flex w-auto flex-col space-y-2 p-2" 
          align="start"
          sideOffset={4}
        >
          {showPresets && (
            <div className="flex items-center justify-center border-b pb-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1">
                {presets.map((preset, index) => (
                  <Button
                    key={index}
                    variant={isPresetActive(preset) ? 'default' : 'ghost'}
                    onClick={() => handlePresetClick(preset)}
                    size="sm"
                    className="text-xs h-8 min-w-0 px-2"
                    title={preset.shortcut ? `Atalho: ${preset.shortcut}` : undefined}
                    disabled={!isValidDateRange(preset.range)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <div className="rounded-md border">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={localDateRange?.from || dateRange?.from}
              selected={localDateRange}
              onSelect={handleDateSelect}
              numberOfMonths={2}
              locale={ptBR}
              disabled={(date) => {
                if (minDate && date < minDate) return true;
                if (maxDate && date > maxDate) return true;
                return false;
              }}
            />
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              {localDateRange?.from && localDateRange?.to && (
                <span>
                  {differenceInDays(localDateRange.to, localDateRange.from) + 1} {t('days')}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                {t('cancel')}
              </Button>
              <Button 
                size="sm" 
                onClick={handleApply}
                disabled={!canApply}
              >
                {t('apply')}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}