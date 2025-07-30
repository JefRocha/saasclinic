import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/libs/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"

interface SearchableSelectItem {
  id: string | number
  name: string
}

interface SearchableSelectProps {
  items: SearchableSelectItem[]
  selectedValue: string | number | undefined
  onValueChange: (value: string | number) => void
  placeholder?: string
  searchPlaceholder?: string
  noResultsText?: string
  isLoading?: boolean
  className?: string
}

export function SearchableSelect({
  items,
  selectedValue,
  onValueChange,
  placeholder = "Select an item",
  searchPlaceholder = "Search...",
  noResultsText = "No items found.",
  isLoading = false,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  /* abre e foca o input */
  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) {
      // espera o CommandInput montar
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }

  /* fecha se o foco sai do popover inteiro */
  const handleBlur = (e: React.FocusEvent) => {
    // se o novo foco NÃO está dentro do popover nem no botão
    const next = e.relatedTarget as HTMLElement | null
    if (
      next &&
      !triggerRef.current?.contains(next) &&
      !inputRef.current?.closest("[data-radix-popper-content]")?.contains(next)
    ) {
      setOpen(false)
    }
  }

  if (isLoading) {
    return <Skeleton className={cn("h-10 w-full", className)} />
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          onFocus={() => handleOpenChange(true)}       {/* 👈 abre ao receber foco */}
          onBlur={handleBlur}                          {/* 👈 fecha ao sair */}
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            selectedValue ? "text-foreground" : "text-muted-foreground",
            className,
          )}
        >
          {selectedValue
            ? items.find((item) => item.id === selectedValue)?.name
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput
            ref={inputRef}
            placeholder={searchPlaceholder}
            /* impede a tecla Tab de fechar o pop-over antes de selecionar */
            onKeyDown={(e) => e.key === "Tab" && e.stopPropagation()}
          />
          <CommandList>
            <CommandEmpty>{noResultsText}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
                  onSelect={() => {
                    onValueChange(item.id)
                    setOpen(false)
                    // devolve foco ao botão para feedback
                    triggerRef.current?.focus()
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
}
