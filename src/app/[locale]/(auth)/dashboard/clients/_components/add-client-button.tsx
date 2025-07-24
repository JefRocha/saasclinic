"use client";

import { PlusCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import UpsertClientForm from "./upsert-client-form";

interface AddClientButtonProps {
  onClientUpsertSuccess: () => void;
}

const AddClientButton = ({ onClientUpsertSuccess }: AddClientButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="default">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Adicionar Cliente
          </span>
        </Button>
      </DialogTrigger>
      <UpsertClientForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={(clientId) => {
          setIsOpen(false);
          onClientUpsertSuccess(clientId);
        }}
        //isOpen={isOpen}
      />
    </Dialog>
  );
};

export default AddClientButton;