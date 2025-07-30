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

/* ─ tipagens ─ */
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
}

/* ─ componente ─ */
/* src/components/ui/searchable-select.tsx */

export const SearchableSelect = React.forwardRef<HTMLButtonElement, Props>(
  (
    { items, selectedValue, onValueChange, placeholder = "Select", ...rest },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)
    const pressedByPointer = React.useRef(false)   // 👈 flag

    const handleOpenChange = (next: boolean) => {
      setOpen(next)
      if (next) requestAnimationFrame(() => inputRef.current?.focus())
    }

    /* ───────────────── render ───────────────── */
    return (
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            /* 1️⃣  mar­ca que foi clique/touch */
            onPointerDown={() => {
              pressedByPointer.current = true
              setTimeout(() => (pressedByPointer.current = false), 0)
            }}
            /* 2️⃣  abre só se NÃO foi clique */
            onFocus={() => {
              if (!pressedByPointer.current) handleOpenChange(true)
            }}
            className="flex h-9 w-full items-center justify-between rounded-md border px-3 py-1 text-sm shadow-sm"
          >
            {selectedValue
              ? items.find((i) => i.id === selectedValue)?.name
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput ref={inputRef} placeholder="Search…" />
            <CommandList>
              <CommandEmpty>No results.</CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.name}
                    onSelect={() => {
                      onValueChange(item.id)
                      setOpen(false)
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

