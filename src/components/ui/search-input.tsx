'use client';

import * as React from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/libs/utils";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearchChange?: (value: string) => void;
}

export function SearchInput({
  className,
  onSearchChange,
  ...props
}: SearchInputProps) {
  const [searchValue, setSearchValue] = React.useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  return (
    <div className={cn("relative w-full", className)}> {/* Adicionado w-full e cn para aplicar className */}
      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Buscar..."
        className={cn("pl-8 w-full", className)}
        value={searchValue}
        onChange={handleInputChange}
        {...props}
      />
    </div>
  );
}
