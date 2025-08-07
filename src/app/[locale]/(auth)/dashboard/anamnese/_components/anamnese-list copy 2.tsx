"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useTransition } from "react";
import type { SortingState } from "@tanstack/react-table";
import { useAuth } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { DataTable } from "./anamnese-data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/libs/utils";

import { getAnamneses, type SearchAnamnesesResult } from "@/actions/get-anamneses";
import { getAnamnesesTableColumns } from "./table-columns";
import UpsertAnamneseButton from "./upsert-anamnese-button";
import { UpsertAnamneseForm } from "./upsert-anamnese-form";
import { Anamnese } from "@/actions/get-anamneses/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ValidationErrorsModalProvider } from "@/components/ui/validation-errors-modal";

export function AnamneseList() {
  const t = useTranslations("AnamneseTable");
  const tForm = useTranslations("AnamneseForm");
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const { orgId } = useAuth();

  console.log("orgId:", orgId);

  const search = searchParams.get("search") || "";
  const initialOrderBy = searchParams.get("orderBy") || "id";
  const initialOrder = searchParams.get("order") || "asc";

  const [sorting, setSorting] = useState<SortingState>([
    { id: initialOrderBy, desc: initialOrder === "desc" },
  ]);
  const [highlightedAnamneseId, setHighlightedAnamneseId] = useState<string | number | null>(null);
  const [selectedAnamneseId, setSelectedAnamneseId] = useState<string | number | null>(null);

  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    return {
      from: startOfMonth(today),
      to: endOfMonth(today),
    };
  });

  const [isUpsertFormOpen, setIsUpsertFormOpen] = useState(false);
  const [initialAnamneseData, setInitialAnamneseData] = useState<Anamnese | undefined>(undefined);

  // Update URL search params when dateRange changes
  useEffect(() => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (dateRange?.from) {
        params.set("startDate", format(dateRange.from, "yyyy-MM-dd"));
      } else {
        params.delete("startDate");
      }
      if (dateRange?.to) {
        params.set("endDate", format(dateRange.to, "yyyy-MM-dd"));
      } else {
        params.delete("endDate");
      }
      router.replace(`?${params.toString()}`);
      queryClient.invalidateQueries({ queryKey: ["anamneses", orgId] });
    });
  }, [dateRange, router, searchParams, queryClient, orgId]);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<SearchAnamnesesResult, Error>({
    queryKey: ["anamneses", orgId],
    queryFn: () => getAnamneses({
      search,
      orderBy: sorting[0].id,
      order: sorting[0].desc ? "desc" : "asc",
      startDate: dateRange?.from?.toISOString(),
      endDate: dateRange?.to?.toISOString(),
    }),
    refetchOnWindowFocus: false,
    enabled: !!orgId,
  });

  // Função para ser chamada em caso de sucesso (criação/edição/exclusão)
  const handleSuccess = (anamneseId?: string | number) => {
    queryClient.invalidateQueries({ queryKey: ["anamneses", orgId] });
    if (anamneseId) {
      setHighlightedAnamneseId(anamneseId);
      setSelectedAnamneseId(anamneseId);
    }
  };

  // Função para lidar com o clique na linha da tabela
  const handleRowClick = (anamneseId: string | number) => {
    setSelectedAnamneseId(anamneseId);
  };

  // Limpa o destaque após alguns segundos
  useEffect(() => {
    if (highlightedAnamneseId) {
      const timer = setTimeout(() => {
        setHighlightedAnamneseId(null);
      }, 3000); // 3 segundos
      return () => clearTimeout(timer);
    }
  }, [highlightedAnamneseId]);

  const handleOpenUpsertForm = (anamnese?: Anamnese) => {
    setInitialAnamneseData(anamnese);
    setIsUpsertFormOpen(true);
  };

  const handleCloseUpsertForm = () => {
    setIsUpsertFormOpen(false);
    setInitialAnamneseData(undefined);
  };

  const columns = getAnamnesesTableColumns(handleSuccess, handleRowClick, handleOpenUpsertForm);

  // Renderiza o Skeleton apenas no carregamento inicial
  if (isLoading && !data) return <Skeleton className="h-[300px] w-full" />;

  if (isError) {
    return (
      <div className="text-center p-6 text-destructive">
        {error.message || "Erro inesperado."}
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full">
          <SearchInput />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>{t("select_date_range_placeholder")}</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
        <UpsertAnamneseButton onAnamneseUpsertSuccess={handleSuccess} onOpenForm={handleOpenUpsertForm} />
      </div>
      <DataTable
        columns={columns}
        data={data?.data || []}
        emptyMessage={t("no_results")}
        onSortingChange={(updater) => {
          startTransition(() => {
            const newSortingState = typeof updater === 'function' ? updater(sorting) : updater;
            setSorting(newSortingState);

            const newOrderBy = newSortingState.length > 0 ? newSortingState[0].id : "id";
            const newOrder = newSortingState.length > 0 && newSortingState[0].desc ? "desc" : "asc";

            const params = new URLSearchParams(searchParams.toString());
            params.set("orderBy", newOrderBy);
            params.set("order", newOrder);
            router.replace(`?${params.toString()}`);

            queryClient.invalidateQueries({ queryKey: ["anamneses", orgId] });
          });
        }}
        sorting={sorting}
        isFetching={isPending}
        highlightedAnamneseId={highlightedAnamneseId}
        selectedAnamneseId={selectedAnamneseId}
        onRowClick={handleRowClick}
      />
      <Dialog open={isUpsertFormOpen} onOpenChange={handleCloseUpsertForm}>
        <DialogContent
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          className="[&>button]:hidden w-full max-w-[1400px] overflow-y-auto focus:outline-none"
        >
          <DialogHeader>
            <DialogTitle>{tForm("form_title")}</DialogTitle>
          </DialogHeader>
          <ValidationErrorsModalProvider>
            <UpsertAnamneseForm
              isOpen={isUpsertFormOpen}
              onClose={handleCloseUpsertForm}
              onSuccess={handleSuccess}
              initialData={initialAnamneseData}
            />
          </ValidationErrorsModalProvider>
        </DialogContent>
      </Dialog>
    </>
  );
}
