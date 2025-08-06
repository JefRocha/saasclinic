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
import { deleteClient } from "@/actions/delete-client";
import UpsertClientForm from "./upsert-client-form";
import { ValidationErrorsModalProvider } from "@/components/ui/validation-errors-modal";

// -------------------------------------------------------------
// Tipagens locais (abreviado)
// -------------------------------------------------------------

type Client = {
  id: number;
  razaoSocial: string | null;
  // outros campos relevantes para ações do cliente
};

type Props = {
  client: Client;
  onRowClick: (id: number) => void;
  onClientUpsertSuccess: (id?: number) => void;
};

// ------------------------------------------------------------------
//  Componente principal – **sem** diálogos aninhados Radix
// ------------------------------------------------------------------

export default function ClientTableActions({
  client,
  onClientUpsertSuccess,
  onRowClick,
}: Props) {
  const t = useTranslations("AnamneseTableActions");

  /* --------------------------- estados locais --------------------------- */
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  /* ---------------------------- delete hook ---------------------------- */
  const { execute, isLoading } = useAction(deleteClient, {
    onSuccess: () => {
      toast.success(t("delete_success"));
      onClientUpsertSuccess();
    },
    onError: () => toast.error(t("delete_error")),
  });

  const handleDelete = () => {
    execute({ id: client.id });
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
          <DropdownMenuItem onSelect={() => onRowClick(client.id)}>
            {t("view")}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              // aguarda o menu fechar antes de abrir o modal
              setTimeout(() => setShowEditDialog(true), 0);
            }}
          >
            {t("edit")}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setShowDeleteDialog(true)}>
            {t("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* EDITAR – usa o Dialog interno do UpsertClientForm */}
      <ValidationErrorsModalProvider>
        <UpsertClientForm
          initialData={client}
          isOpen={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          onSuccess={(id) => {
            setShowEditDialog(false);
            onClientUpsertSuccess(id);
          }}
        />
      </ValidationErrorsModalProvider>

      {/* CONFIRMA EXCLUSÃO */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete_confirm_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete_confirm_description", { id: client.id })}
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
