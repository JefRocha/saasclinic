"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";

// Definir o tipo Anamnese com base no que a action getAnamneses retorna
interface Anamnese {
  id: number;
  clienteNome: string | null;
  colaboradorNome: string | null;
  total: number | null;
  tipo: string;
  cargo: string | null;
}

interface AnamneseTableActionsProps {
  anamnese: Anamnese;
  onAnamneseUpsertSuccess: (anamneseId?: string | number) => void;
  onRowClick: (anamneseId: string | number) => void;
}

export default function AnamneseTableActions({
  anamnese,
  onAnamneseUpsertSuccess,
  onRowClick,
}: AnamneseTableActionsProps) {
  const t = useTranslations("AnamneseTable");

  const handleEdit = () => {
    // TODO: Implementar lógica de edição
    console.log("Editar anamnese:", anamnese.id);
  };

  const handleDelete = () => {
    // TODO: Implementar lógica de exclusão
    console.log("Excluir anamnese:", anamnese.id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t("actions_label")}</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleEdit}>
          {t("edit_action")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete}>
          {t("delete_action")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
