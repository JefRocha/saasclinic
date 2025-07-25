"use client";

import { PlusCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import UpsertMedicoForm from "./upsert-medico-form";

interface AddMedicoButtonProps {
  onMedicoUpsertSuccess: (medicoId?: string | number) => void;
}

const AddMedicoButton = ({ onMedicoUpsertSuccess }: AddMedicoButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="default">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Adicionar Médico
          </span>
        </Button>
      </DialogTrigger>
      <UpsertMedicoForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={(medicoId) => {
          setIsOpen(false);
          onMedicoUpsertSuccess(medicoId);
        }}
      />
    </Dialog>
  );
};

export default AddMedicoButton;