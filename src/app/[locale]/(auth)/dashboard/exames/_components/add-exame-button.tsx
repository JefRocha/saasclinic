"use client";

import { PlusCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import UpsertExameForm from "./upsert-exame-form";

interface AddExameButtonProps {
  onExameUpsertSuccess: (exameId?: string | number) => void;
}

const AddExameButton = ({ onExameUpsertSuccess }: AddExameButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="default">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Adicionar Exame
          </span>
        </Button>
      </DialogTrigger>
      <UpsertExameForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={(exameId) => {
          setIsOpen(false);
          onExameUpsertSuccess(exameId);
        }}
      />
    </Dialog>
  );
};

export default AddExameButton;