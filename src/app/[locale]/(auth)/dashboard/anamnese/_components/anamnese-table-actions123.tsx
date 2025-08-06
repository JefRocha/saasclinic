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
import { UpsertAnamneseForm } from "./upsert-anamnese-form";
import { ValidationErrorsModalProvider } from "@/components/ui/validation-errors-modal";

type Anamnese = {
  id: number;
  clienteId: number;
  colaboradorId: number;
  data: Date;
  formaPagto: string;
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

type AnamneseTableActionsProps = {
  anamnese: Anamnese;
  onRowClick: (id: number) => void;
  onAnamneseUpsertSuccess: (id?: number) => void;
};

export function AnamneseTableActions({
  anamnese,
  onAnamneseUpsertSuccess,
  onRowClick,
}: AnamneseTableActionsProps) {
  const t = useTranslations("AnamneseTableActions");

  // Diálogos controlados por boolean‑state únicos (sem overlap)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // DELETE hook
  const { execute, isLoading } = useAction(deleteAnamnese, {
    onSuccess: () => {
      toast.success(t("delete_success"));
      onAnamneseUpsertSuccess();
    },
    onError: (error: unknown) => {
      console.error(error);
      toast.error(t("delete_error"));
    },
  });

  // Handlers
  const handleDelete = () => {
    execute({ id: anamnese.id });
    setShowDeleteDialog(false);
  };

  return (
    <>
      {/* MENU DE AÇÕES */}
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
          <DropdownMenuItem onSelect={() => setShowEditDialog(true)}>
            {t("edit")}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setShowDeleteDialog(true)}>
            {t("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* EDITAR */}
      <ValidationErrorsModalProvider>
        <UpsertAnamneseForm
          initialData={anamnese}
          isOpen={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          onSuccess={(id) => {
            setShowEditDialog(false);
            onAnamneseUpsertSuccess(id);
          }}
        />
      </ValidationErrorsModalProvider>

      {/* EXCLUIR */}
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
