import { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/libs/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { FieldValues } from "react-hook-form";
import React from "react";

interface FormDatePickerProps<T extends FieldValues> {
  control: Control<T>;
  name: keyof T;
  label: string;
  placeholder?: string;
  className?: string;
}

export const FormDatePicker = React.forwardRef<HTMLButtonElement, FormDatePickerProps<any>>(
  ({
    control,
    name,
    label,
    placeholder,
    className,
  }, ref) => {
    return (
      <FormField
        control={control}
        name={name as string}
        render={({ field }) => (
          <FormItem className={cn("flex flex-col", className)}>
            <FormLabel>{label}</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                    ref={ref}
                  >
                    {field.value ? (
                      format(new Date(field.value), "PPP", { locale: ptBR })
                    ) : (
                      <span>{placeholder || "Pick a date"}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={field.onChange}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }
);
