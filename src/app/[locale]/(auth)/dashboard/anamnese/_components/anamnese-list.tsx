"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useState,
  useEffect,
  useTransition,
  useMemo,
  useCallback,
} from "react";
import type { SortingState, Updater } from "@tanstack/react-table";
import { useAuth } from "@clerk/nextjs";
import * as nextIntl from "next-intl";
import { DateRange } from "react-day-picker";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

import { DataTable as AnamneseDataTable } from "./anamnese-data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchInput } from "@/components/ui/search-input";
import { DateRangePicker } from "@/components/ui/date-range-picker";

import { getAnamneses } from "@/actions/get-anamneses";
import { getAnamnesesTableColumns } from "./table-columns";
import UpsertAnamneseButton from "./upsert-anamnese-button";
import { UpsertAnamneseForm } from "./upsert-anamnese-form";
import { Anamnese } from "@/actions/get-anamneses/schema";
import type { UpsertAnamneseForm as UpsertAnamneseFormData } from "@/actions/upsert-anamnese/schema";
import { exametipo_enum, formapagto_enum } from "@/models/Schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ValidationErrorsModalProvider } from "@/components/ui/validation-errors-modal";

export function AnamneseList() {
  const tForm = (nextIntl as any).useTranslations("AnamneseForm");
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [, startTransition] = useTransition();
  const { orgId } = useAuth();

  const search = searchParams.get("search") || "";
  const initialOrderBy = searchParams.get("orderBy") || "id";
  const initialOrder = searchParams.get("order") || "asc";

  const [sorting, setSorting] = useState<SortingState>([
    { id: initialOrderBy, desc: initialOrder === "desc" },
  ]);

  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const today = dayjs();
    return {
      from: today.startOf("month").toDate(),
      to: today.endOf("month").toDate(),
    };
  });

  const [isUpsertFormOpen, setIsUpsertFormOpen] = useState(false);
  const [initialAnamneseData, setInitialAnamneseData] = useState<
    UpsertAnamneseFormData | undefined
  >(undefined);

  const mapAnamneseToFormData = useCallback(
    (anamnese: Anamnese): UpsertAnamneseFormData => ({
      id: anamnese.id,
      clienteId: anamnese.clienteId,
      colaboradorId: anamnese.colaboradorId,
      atendenteId: anamnese.atendenteId,
      data: new Date(anamnese.data),
      formapagto:
        anamnese.formapagto as (typeof formapagto_enum.enumValues)[number],
      tipo: anamnese.tipo as (typeof exametipo_enum.enumValues)[number],
      cargo: anamnese.cargo,
      setor: anamnese.setor ?? undefined,
      solicitante: anamnese.solicitante ?? undefined,
      items: anamnese.items,
    }),
    []
  );

  // Update URL search params when dateRange changes
  useEffect(() => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (dateRange?.from) {
        params.set("startDate", dayjs(dateRange.from).format("YYYY-MM-DD"));
      } else {
        params.delete("startDate");
      }
      if (dateRange?.to) {
        params.set("endDate", dayjs(dateRange.to).format("YYYY-MM-DD"));
      } else {
        params.delete("endDate");
      }
      router.replace(`?${params.toString()}`);
      queryClient.invalidateQueries({ queryKey: ["anamneses", orgId] });
    });
  }, [dateRange, router, searchParams, queryClient, orgId]);

  const derivedOrderBy = sorting[0]?.id ?? "id";
  const derivedOrder = sorting[0]?.desc ? "desc" : "asc";
  const derivedStartDateIso = dateRange?.from
    ? dayjs(dateRange.from).utc(true).startOf("day").toISOString()
    : undefined;
  const derivedEndDateIso = dateRange?.to
    ? dayjs(dateRange.to).utc(true).endOf("day").toISOString()
    : undefined;

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: [
      "anamneses",
      orgId,
      search,
      derivedOrderBy,
      derivedOrder,
      derivedStartDateIso,
      derivedEndDateIso,
    ],
    queryFn: () =>
      getAnamneses({
        search,
        orderBy: derivedOrderBy,
        order: derivedOrder,
        startDate: derivedStartDateIso,
        endDate: derivedEndDateIso,
      }),
    refetchOnWindowFocus: false,
    enabled: !!orgId,
  });

  // Função para ser chamada em caso de sucesso (criação/edição/exclusão)
  const handleSuccess = useCallback(
    (anamneseId?: string | number) => {
      void anamneseId;
      queryClient.invalidateQueries({ queryKey: ["anamneses", orgId] });
      // if (anamneseId) {
      //   setHighlightedAnamneseId(anamneseId);
      //   setSelectedAnamneseId(anamneseId);
      // }
    },
    [orgId, queryClient]
  );

  // Função para lidar com o clique na linha da tabela
  const handleRowClick = useCallback((anamneseId: string | number) => {
    void anamneseId;
    // setSelectedAnamneseId(anamneseId);
  }, []);

  const handleOpenUpsertForm = useCallback(
    (anamnese?: Anamnese) => {
      setInitialAnamneseData(
        anamnese ? mapAnamneseToFormData(anamnese) : undefined
      );
      setIsUpsertFormOpen(true);
    },
    [mapAnamneseToFormData]
  );

  const handleCloseUpsertForm = useCallback(() => {
    setIsUpsertFormOpen(false);
    setInitialAnamneseData(undefined);
  }, []);

  const columns = useMemo(
    () =>
      getAnamnesesTableColumns(
        handleSuccess,
        handleRowClick,
        handleOpenUpsertForm
      ),
    [handleSuccess, handleRowClick, handleOpenUpsertForm]
  );

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
          <DateRangePicker
            dateRange={dateRange}
            setDateRange={setDateRange}
            className="w-full md:w-auto"
          />
        </div>
        <UpsertAnamneseButton
          onAnamneseUpsertSuccess={handleSuccess}
          onOpenForm={handleOpenUpsertForm}
        />
      </div>
      <AnamneseDataTable
        columns={columns}
        data={(data as any)?.data?.data || []}
        onSortingChange={(updater: Updater<SortingState>) => {
          startTransition(() => {
            const newSortingState =
              typeof updater === "function" ? updater(sorting) : updater;
            setSorting(newSortingState);

            const first = newSortingState[0];
            const newOrderBy = first?.id ?? "id";
            const newOrder = first?.desc ? "desc" : "asc";

            const params = new URLSearchParams(searchParams.toString());
            params.set("orderBy", newOrderBy);
            params.set("order", newOrder);
            router.replace(`?${params.toString()}`);

            queryClient.invalidateQueries({ queryKey: ["anamneses", orgId] });
          });
        }}
        sorting={sorting}
        isFetching={isFetching}
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
