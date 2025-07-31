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

import UpsertExameForm from "./upsert-exame-form";
import { deleteExame } from "@/actions/delete-exame";
import { upsertExameSchema } from "@/actions/upsert-exame/schema";

type Exame = typeof upsertExameSchema._type;

interface ExamesTableActionsProps {
  exame: Exame;
  onExameUpsertSuccess: (exameId?: string | number) => void;
  onRowClick: (exameId: string | number) => void;
}

const ExamesTableActions = ({ exame, onExameUpsertSuccess, onRowClick }: ExamesTableActionsProps) => {
  const [upsertSheetIsOpen, setUpsertSheetIsOpen] = useState(false);

  const handleDeleteExameClick = async () => {
    if (!exame) return;

    try {
      const res = await deleteExame({ id: exame.id as number });

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Exame excluído com sucesso.");
      onExameUpsertSuccess(exame.id);
    } catch (err) {
      toast.error("Erro inesperado ao deletar exame.");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onPointerDownCapture={() => onRowClick(exame.id as number)}>
          <Button variant="ghost" size="icon">
            <MoreVerticalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{exame.descricao}</DropdownMenuLabel>
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
                  Tem certeza que deseja excluir esse exame?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação não pode ser revertida.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteExameClick}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>

      {upsertSheetIsOpen && (
        <UpsertExameForm
          initialData={exame}
          isOpen={upsertSheetIsOpen}
          onClose={() => setUpsertSheetIsOpen(false)}
          onSuccess={(exameId) => {
            setUpsertSheetIsOpen(false);
            setTimeout(() => {
              onExameUpsertSuccess(exameId);
            }, 100);
          }}
        />
      )}
    </>
  );
};

export default ExamesTableActions;