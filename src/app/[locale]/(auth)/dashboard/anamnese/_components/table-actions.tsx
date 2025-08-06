"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { useAction } from "@/hooks/use-action";
import { deleteAnamnese } from "@/actions/delete-anamnese";

// -------------------------------------------------------------
// Tipagens locais (abreviado)
// -------------------------------------------------------------

type Anamnese = {
  id: number;
  // outros campos não relevantes para ações
};

type Props = {
  anamnese: Anamnese;
  onRowClick: (id: number) => void;
  onAnamneseUpsertSuccess: (id?: number) => void;
  onEditAnamnese: (anamnese: Anamnese) => void; // New prop
};

// ------------------------------------------------------------------
//  Componente principal – **sem** diálogos aninhados Radix
// ------------------------------------------------------------------

export default function AnamneseTableActions({
  anamnese,
  onAnamneseUpsertSuccess,
  onRowClick,
  onEditAnamnese, // Destructure new prop
}: Props) {
  const t = useTranslations("AnamneseTableActions");

  /* --------------------------- estados locais --------------------------- */
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  /* ---------------------------- delete hook ---------------------------- */
  const { execute, isLoading } = useAction(deleteAnamnese, {
    onSuccess: () => {
      toast.success(t("delete_success"));
      onAnamneseUpsertSuccess();
    },
    onError: () => toast.error(t("delete_error")),
  });

  const handleDelete = () => {
    execute({ id: anamnese.id });
    setShowDeleteDialog(false);
  };

  /* ---------------------------- render ---------------------------- */
  return (
    <>
      {/* Dropdown de ações */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">{t("open_menu")}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => onRowClick(anamnese.id)}>
            {t("view")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => onEditAnamnese(anamnese)} // Call new prop
          >
            {t("edit")}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setShowDeleteDialog(true)}>
            {t("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* CONFIRMA EXCLUSÃO */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete_confirm_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete_confirm_description", { id: anamnese.id })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
              {t("continue")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
