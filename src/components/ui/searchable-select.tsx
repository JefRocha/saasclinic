'use client';

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";

interface SearchableSelectItem {
  id: string | number;
  name: string;
}

interface SearchableSelectProps {
  items: SearchableSelectItem[];
  selectedValue: string | number | null;
  onValueChange: (value: string | number | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsText?: string;
  selectAllText?: string;
  isLoading?: boolean;
  className?: string;
}

export function SearchableSelect({
  items,
  selectedValue,
  onValueChange,
  placeholder = "Selecione um item...",
  searchPlaceholder = "Buscar item...",
  noResultsText = "Nenhum item encontrado.",
  selectAllText = "Todos",
  isLoading = false,
  className = "",
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);

  if (isLoading) {
    return <Skeleton className={cn("h-10 w-full", className)} />;
  }

  const selectedItem = items.find((item) => item.id === selectedValue);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between shadow-md border border-gray-400", className)}
        >
          {selectedValue ? selectedItem?.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-full p-0", className)}>
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{noResultsText}</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onValueChange(null);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedValue === null ? "opacity-100" : "opacity-0"
                  )}
                />
                {selectAllText}
              </CommandItem>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name || ""}
                  onSelect={(currentValue) => {
                    const selected = items.find(i => i.name.toLowerCase() === currentValue.toLowerCase());
                    if (selected) {
                      onValueChange(selected.id);
                    }
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedValue === item.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
