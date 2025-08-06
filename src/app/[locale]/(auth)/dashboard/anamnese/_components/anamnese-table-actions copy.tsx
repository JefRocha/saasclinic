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
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useAction } from "@/hooks/use-action";
import { deleteAnamnese } from "@/actions/delete-anamnese";
import { UpsertAnamneseForm } from "./upsert-anamnese-form";
import { ValidationErrorsModalProvider } from "@/components/ui/validation-errors-modal";

interface Anamnese {
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
  const t = useTranslations("AnamneseTableActions");
  const tForm = useTranslations("AnamneseForm");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const { execute, isLoading } = useAction(deleteAnamnese, {
    onSuccess: () => {
      toast.success(t("delete_success"));
      onAnamneseUpsertSuccess();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const handleDelete = () => {
    execute({ id: anamnese.id });
    setShowDeleteDialog(false);
  };

  return (
    <>
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

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          className="[&>button]:hidden w-full max-w-[1400px] overflow-y-auto focus:outline-none"
        >
          <DialogHeader>
            <DialogTitle>{tForm('form_title')}</DialogTitle>
          </DialogHeader>
          <ValidationErrorsModalProvider>
            <UpsertAnamneseForm
              initialData={anamnese}
              isOpen={showEditDialog}
              onClose={() => setShowEditDialog(false)}
              onSuccess={(anamneseId) => {
                setShowEditDialog(false);
                onAnamneseUpsertSuccess(anamneseId);
              }}
            />
          </ValidationErrorsModalProvider>
        </DialogContent>
      </Dialog>

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