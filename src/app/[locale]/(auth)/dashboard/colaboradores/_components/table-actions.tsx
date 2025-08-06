'use client';

import { EditIcon, MoreVerticalIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { UpsertColaboradorForm } from "./upsert-colaborador-form";
import { deleteColaborador } from "@/actions/delete-colaborador";
import { useAction } from "@/hooks/use-action";
import { colaboradorTable } from "@/models/Schema";

type Colaborador = typeof colaboradorTable.$inferSelect;

interface ColaboradoresTableActionsProps {
  colaborador: Colaborador;
  onColaboradorUpsertSuccess: (colaboradorId?: string | number) => void;
  onRowClick: (colaboradorId: string | number) => void;
}

const ColaboradoresTableActions = ({ colaborador, onColaboradorUpsertSuccess, onRowClick }: ColaboradoresTableActionsProps) => {
  const [upsertSheetIsOpen, setUpsertSheetIsOpen] = useState(false);

  const { execute: executeDelete, isLoading: isDeleting } = useAction(deleteColaborador, {
    onSuccess: () => {
      toast.success("Colaborador excluído com sucesso.");
      onColaboradorUpsertSuccess(colaborador.id);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDeleteColaboradorClick = async () => {
    if (!colaborador) return;
    executeDelete({ id: colaborador.id });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onPointerDownCapture={() => onRowClick(colaborador.id)}>
          <Button variant="ghost" size="icon">
            <MoreVerticalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{colaborador.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setUpsertSheetIsOpen(true)}>
            <EditIcon className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <TrashIcon className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Tem certeza que deseja excluir esse colaborador?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação não pode ser revertida.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteColaboradorClick} disabled={isDeleting}>
                  {isDeleting ? "Excluindo..." : "Excluir"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>

      {upsertSheetIsOpen && (
        <UpsertColaboradorForm
          initialData={colaborador}
          isOpen={upsertSheetIsOpen}
          onClose={() => setUpsertSheetIsOpen(false)}
          onSuccess={(colaboradorId) => {
            setUpsertSheetIsOpen(false);
            setTimeout(() => {
              onColaboradorUpsertSuccess(colaboradorId);
            }, 100);
          }}
        />
      )}
    </>
  );
};

export default ColaboradoresTableActions;