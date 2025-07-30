"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";

import { Input } from "@/components/ui/input";

export function SearchInput() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSearch = searchParams.get("search") || "";

  const [searchValue, setSearchValue] = React.useState(initialSearch);
  const [debouncedSearchValue] = useDebounce(searchValue, 500);

  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearchValue) {
      params.set("search", debouncedSearchValue);
    } else {
      params.delete("search");
    }
    router.replace(`?${params.toString()}`);
  }, [debouncedSearchValue, router, searchParams]);

  return (
    <div className="relative flex-1">
      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Buscar..."
        className="pl-8 w-full"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
    </div>
  );
}
