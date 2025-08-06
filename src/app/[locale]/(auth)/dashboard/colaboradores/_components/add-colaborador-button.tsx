"use client";

import { PlusCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import { UpsertColaboradorForm } from "./upsert-colaborador-form";

interface AddColaboradorButtonProps {
  onColaboradorUpsertSuccess: () => void;
}

const AddColaboradorButton = ({ onColaboradorUpsertSuccess }: AddColaboradorButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="default">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Adicionar Colaborador
          </span>
        </Button>
      </DialogTrigger>
      <UpsertColaboradorForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={(colaboradorId) => {
          setIsOpen(false);
          onColaboradorUpsertSuccess(colaboradorId);
        }}
      />
    </Dialog>
  );
};

export default AddColaboradorButton;
