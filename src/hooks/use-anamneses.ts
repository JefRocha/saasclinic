import { useQuery, useQueryClient } from "@tanstack/react-query";

// Tipos - adapte conforme seu schema
type SearchAnamnesesParams = {
  search?: string;
  page?: number;
  orderBy?: string;
  order?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
};

type AnamneseData = {
  id: number;
  clienteId: number;
  colaboradorId: number;
  data: Date;
  formapagto: string;
  tipo: string;
  cargo: string;
  setor: string | null;
  solicitante: string | null;
  status: string | null;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
  atendenteId: string;
  clienteRazaoSocial: string;
  clienteFantasia: string | null;
  colaboradorNome: string;
};

type SearchAnamnesesResult = {
  data: AnamneseData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// Função que fará fetch via API Route
async function fetchAnamneses(params: SearchAnamnesesParams): Promise<SearchAnamnesesResult> {
  const searchParams = new URLSearchParams();
  
  if (params.search) searchParams.set("search", params.search);
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.orderBy) searchParams.set("orderBy", params.orderBy);
  if (params.order) searchParams.set("order", params.order);
  if (params.startDate) searchParams.set("startDate", params.startDate);
  if (params.endDate) searchParams.set("endDate", params.endDate);

  const response = await fetch(`/api/anamneses?${searchParams.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Erro ao buscar anamneses: ${response.statusText}`);
  }
  
  return response.json();
}

export function useAnamneses(params: SearchAnamnesesParams, enabled: boolean = true) {
  const queryKey = [
    "anamneses",
    params.search,
    params.page,
    params.orderBy,
    params.order,
    params.startDate,
    params.endDate,
  ];

  return useQuery<SearchAnamnesesResult, Error>({
    queryKey,
    queryFn: () => fetchAnamneses(params),
    enabled,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para invalidar queries de anamneses
export function useAnamnesesQueryClient() {
  const queryClient = useQueryClient();

  const invalidateAnamneses = () => {
    queryClient.invalidateQueries({ queryKey: ["anamneses"] });
  };

  const setAnamneseData = (anamneseId: number, data: Partial<AnamneseData>) => {
    queryClient.setQueryData(["anamneses"], (oldData: SearchAnamnesesResult | undefined) => {
      if (!oldData) return oldData;
      
      return {
        ...oldData,
        data: oldData.data.map(anamnese => 
          anamnese.id === anamneseId ? { ...anamnese, ...data } : anamnese
        )
      };
    });
  };

  return {
    invalidateAnamneses,
    setAnamneseData,
  };
}