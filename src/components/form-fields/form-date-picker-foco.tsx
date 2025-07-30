import { Control, FieldValues } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/libs/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import React, { useState } from "react";

interface FormDatePickerFocoProps<T extends FieldValues> {
  control: Control<T>;
  name: keyof T;
  label: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export const FormDatePickerFoco = React.forwardRef<
  HTMLButtonElement, 
  FormDatePickerFocoProps<any>
>(({ 
  control, 
  name, 
  label, 
  placeholder = "Escolha uma data", 
  className,
  disabled = false,
  required = false
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(true);
    }
    
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <FormField
      control={control}
      name={name as string}
      render={({ field, fieldState }) => (
        <FormItem className={cn("flex flex-col", className)}>
          <FormLabel className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
            {label}
          </FormLabel>

          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                ref={ref}
                variant="outline"
                disabled={disabled}
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="dialog"
                aria-label={`${label}. ${field.value ? `Selecionado: ${format(new Date(field.value), "PPP", { locale: ptBR })}` : 'Nenhuma data selecionada'}`}
                aria-invalid={fieldState.invalid}
                aria-describedby={fieldState.error ? `${name as string}-error` : undefined}
                onKeyDown={handleKeyDown}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !field.value && "text-muted-foreground",
                  fieldState.error && "border-destructive focus:border-destructive"
                )}
              >
                {field.value ? (
                  format(new Date(field.value), "PPP", { locale: ptBR })
                ) : (
                  <span>{placeholder}</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value ? new Date(field.value) : undefined}
                onSelect={(date) => {
                  field.onChange(date);
                  setIsOpen(false);
                }}
                disabled={disabled}
                initialFocus
                locale={ptBR}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsOpen(false);
                    // Retorna o focus para o botão
                    setTimeout(() => {
                      if (ref && 'current' in ref && ref.current) {
                        ref.current.focus();
                      }
                    }, 0);
                  }
                }}
                className="rounded-md border"
              />
            </PopoverContent>
          </Popover>

          <FormMessage id={fieldState.error ? `${name as string}-error` : undefined} />
        </FormItem>
      )}
    />
  );
});

FormDatePickerFoco.displayName = "FormDatePickerFoco";