// src/types/clients.ts
export interface Client {
  id?: number;
  razaoSocial: string;
  cnpj?: string;
  telefone?: string;
  [key: string]: any; // se tiver campos extras
}

export interface SearchClientsResult {
  data: Client[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}