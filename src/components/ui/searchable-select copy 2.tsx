"use client"

import * as React from "react"
import {
  Check,
  ChevronsUpDown,
  Plus,
} from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/libs/utils"

/* ──────────────────────── Tipagens ──────────────────────── */
interface Item {
  id: string | number
  name: string
}

interface Props {
  items: Item[]
  selectedValue: string | number | undefined
  onValueChange: (v: string | number) => void

  placeholder?: string
  searchPlaceholder?: string
  noResultsText?: string
  isLoading?: boolean
  className?: string

  /** se fornecido, exibe item “+ …” que dispara o callback */
  onCreate?: () => void
  createLabel?: string
}

/* ──────────────────────── Componente ──────────────────────── */
export const SearchableSelect = React.forwardRef<HTMLButtonElement, Props>(
  (
    {
      items,
      selectedValue,
      onValueChange,
      placeholder = "Select",
      searchPlaceholder = "Search...",
      noResultsText = "No results.",
      isLoading = false,
      className,
      onCreate,
      createLabel = "Cadastrar novo",
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)

    const triggerRef = React.useRef<HTMLButtonElement>(null)

    /* flag p/ distinguir foco via clique */
    const pressedByPointer = React.useRef(false)

    const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      console.log("SearchableSelect: Popover opened. Attempting to focus CommandInput...");
      // Pequeno delay para garantir que o CommandInput esteja renderizado
      setTimeout(() => {
        inputRef.current?.focus();
        console.log("SearchableSelect: Elemento focado após setTimeout:", document.activeElement);
        if (inputRef.current && document.activeElement === inputRef.current) {
          console.log("SearchableSelect: CommandInput focado com sucesso!");
        } else {
          console.log("SearchableSelect: Falha ao focar CommandInput ou foco movido.");
        }
      }, 100);
    } else {
      console.log("SearchableSelect: Popover closed.");
    }
  };

    /* loader */
    if (isLoading) return <Skeleton className={cn("h-10 w-full", className)} />

    return (
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            ref={ref} // Atribui a ref diretamente aqui
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "flex h-9 w-full items-center justify-between rounded-md border px-3 py-1 text-sm shadow-sm",
              selectedValue ? "text-foreground" : "text-muted-foreground",
              className,
            )}
            onPointerDown={() => {
              pressedByPointer.current = true
              setTimeout(() => (pressedByPointer.current = false), 0)
            }}
            onFocus={() => {
              if (!pressedByPointer.current) handleOpenChange(true)
            }}
          >
            {selectedValue
              ? items.find((i) => i.id === selectedValue)?.name
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={4}
          className="w-[var(--radix-popover-trigger-width)] p-0"
        >
          <Command className="w-full">
            <CommandInput
              ref={inputRef}
              placeholder={searchPlaceholder}
              className="w-full max-w-none px-3 py-2"
            />

            <CommandList>
              <CommandEmpty>
                {noResultsText}
                {onCreate && (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      onCreate()
                    }}
                    className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50"
                  >
                    <Plus className="size-4" />
                    {createLabel}
                  </button>
                )}
              </CommandEmpty>

              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.name}
                    onSelect={() => {
                      onValueChange(item.id)
                      setOpen(false)
                      ref.current?.blur() // Adiciona o blur aqui
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedValue === item.id ? "opacity-100" : "opacity-0",
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
    )
  },
)
SearchableSelect.displayName = "SearchableSelect"
