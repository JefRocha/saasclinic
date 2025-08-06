import { Control, FieldValues } from "react-hook-form";
import { FormControl, FormItem, FormLabel, FormMessage, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NumericFormat, NumericFormatProps } from 'react-number-format';
import React from "react";

interface FormNumberInputProps<T extends FieldValues> {
  control: Control<T>;
  name: keyof T;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  // Adicione outras props do NumericFormat que você possa precisar
  prefix?: string;
  suffix?: string;
  decimalScale?: number;
  fixedDecimalScale?: boolean;
  allowNegative?: boolean;
  thousandsGroupStyle?: 'thousand' | 'lakh' | 'wan';
  decimalSeparator?: string;
  thousandSeparator?: string | boolean;
}

export function FormNumberInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  disabled = false,
  prefix,
  suffix,
  decimalScale = 2,
  fixedDecimalScale = true,
  allowNegative = false,
  thousandsGroupStyle = 'thousand',
  decimalSeparator = ',',
  thousandSeparator = '.',
}: FormNumberInputProps<T>) {
  return (
    <FormField
      control={control}
      name={name as string}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <NumericFormat
              {...field}
              customInput={Input}
              placeholder={placeholder}
              disabled={disabled}
              prefix={prefix}
              suffix={suffix}
              decimalScale={decimalScale}
              fixedDecimalScale={fixedDecimalScale}
              allowNegative={allowNegative}
              thousandsGroupStyle={thousandsGroupStyle}
              decimalSeparator={decimalSeparator}
              thousandSeparator={thousandSeparator}
              onValueChange={(values) => {
                field.onChange(values.floatValue);
              }}
              value={field.value === null || field.value === undefined ? '' : String(field.value)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
