'use client';

import { useState } from "react";
import { useTranslations } from "next-intl";
import * as XLSX from 'xlsx';

import {
  PageContainer,
  PageHeader,
  PageHeaderContent,
  PageTitle,
  PageDescription,
  PageContent,
} from "@/components/ui/page-container";
import { Button } from "@/components/ui/button";
import { ClientsSelect } from "./clients-select";
import { ExamesCliList } from "./exames-cli-list";
import { exportExamesCli } from "@/actions/export-exames-cli";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

export function ExamesPorClientePageContent() {
  const t = useTranslations("ExamesPorClientePage");
  const [selectedClientId, setSelectedClientId] = useState<string | number | null>(null);
  const [isListEmpty, setIsListEmpty] = useState(true); // Novo estado
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";

  const handleDataLoaded = (data: any[]) => {
    setIsListEmpty(data.length === 0);
  };

  const handleExportToExcel = async () => {
    try {
      const result = await exportExamesCli({ clientId: selectedClientId, search });
      console.log("Result from exportExamesCli:", result);

      const dataToExport = result.data; // Acessar a propriedade 'data' do resultado

      if (!dataToExport || dataToExport.length === 0) {
        toast.info("Nenhum dado para exportar.");
        return;
      }

      // Preparar os dados para o Excel
      const ws_data = dataToExport.map(item => ({
        ID: item.id,
        Cliente: item.clienteNome,
        Exame: item.exameDescricao,
        Descricao: item.descricao,
        Valor: item.valor,
        Cargo: item.cargo,
        "Cod. Antigo": item.codExameAnt,
      }));

      const ws = XLSX.utils.json_to_sheet(ws_data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "ExamesPorCliente");
      XLSX.writeFile(wb, "exames_por_cliente.xlsx");

      toast.success("Dados exportados com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar para Excel:", error);
      toast.error("Erro ao exportar dados para Excel.");
    }
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>{t("title")}</PageTitle>
          <PageDescription>{t("description")}</PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <div className="mb-4 flex items-center justify-between">
          <ClientsSelect
            selectedClientId={selectedClientId}
            onClientChange={setSelectedClientId}
          />
          <div className="flex items-center gap-4">
            <Button
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={handleExportToExcel}
              disabled={isListEmpty} // Desabilita o botão se a lista estiver vazia
            >
              Exportar p/ Excel
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white" disabled={isListEmpty}>Imprimir</Button>
          </div>
        </div>
        <ExamesCliList clientId={selectedClientId} onDataLoaded={handleDataLoaded} />
      </PageContent>
    </PageContainer>
  );
}