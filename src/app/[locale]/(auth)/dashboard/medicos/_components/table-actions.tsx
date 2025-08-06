"use client";

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
import { Sheet } from "@/components/ui/sheet";

import UpsertMedicoForm from "./upsert-medico-form";
import { deleteMedico } from "@/actions/delete-medico";
import { upsertMedicoSchema } from "@/actions/upsert-medico/schema";

type Medico = typeof upsertMedicoSchema._type;

interface MedicosTableActionsProps {
  medico: Medico;
  onMedicoUpsertSuccess: (medicoId?: string | number) => void;
  onRowClick: (medicoId: string | number) => void;
}

const MedicosTableActions = ({ medico, onMedicoUpsertSuccess, onRowClick }: MedicosTableActionsProps) => {
  const [upsertSheetIsOpen, setUpsertSheetIsOpen] = useState(false);

  const handleDeleteMedicoClick = async () => {
    if (!medico) return;

    try {
      const res = await deleteMedico({ id: medico.id as number });

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Médico excluído com sucesso.");
      onMedicoUpsertSuccess(medico.id);
    } catch (err) {
      toast.error("Erro inesperado ao deletar médico.");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onPointerDownCapture={() => onRowClick(medico.id as number)}>
          <Button variant="ghost" size="icon">
            <MoreVerticalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{medico.nome}</DropdownMenuLabel>
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
                  Tem certeza que deseja excluir esse médico?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação não pode ser revertida.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteMedicoClick}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>

      {upsertSheetIsOpen && (
        <UpsertMedicoForm
          initialData={medico}
          isOpen={upsertSheetIsOpen}
          onClose={() => setUpsertSheetIsOpen(false)}
          onSuccess={(medicoId) => {
            setUpsertSheetIsOpen(false);
            setTimeout(() => {
              onMedicoUpsertSuccess(medicoId);
            }, 100);
          }}
        />
      )}
    </>
  );
};

export default MedicosTableActions;