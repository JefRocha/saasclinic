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

import UpsertClientForm from "./upsert-client-form";

// Interface simplificada: apenas os campos utilizados
interface ClientsTableActionsProps {
  client: Client;
  onClientUpsertSuccess: () => void;
}

const ClientsTableActions = ({ client, onClientUpsertSuccess }: ClientsTableActionsProps) => {
  const [upsertSheetIsOpen, setUpsertSheetIsOpen] = useState(false);

  const handleDeleteClientClick = async () => {
    if (!client) return;

    try {
      const res = await fetch(`/api/clients?id=${client.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.message || "Erro ao deletar cliente.");
        return;
      }

      toast.success("Cliente excluído com sucesso.");
      onClientUpsertSuccess();
    } catch (err) {
      toast.error("Erro inesperado ao deletar cliente.");
    }
  };

  return (
    <>
      <Sheet open={upsertSheetIsOpen} onOpenChange={setUpsertSheetIsOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>{client.fantasia}</DropdownMenuLabel>
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
                    Tem certeza que deseja excluir esse cliente?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação não pode ser revertida. Isso irá deletar o paciente e todas as consultas agendadas.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteClientClick}>
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>

        <UpsertClientForm
          initialData={client}
          isOpen={upsertSheetIsOpen}
          onClose={() => setUpsertSheetIsOpen(false)} 
          onSuccess={() => {
            setUpsertSheetIsOpen(false);
            onClientUpsertSuccess();
          }}
        />
      </Sheet>
    </>
  );
};

export default ClientsTableActions;
