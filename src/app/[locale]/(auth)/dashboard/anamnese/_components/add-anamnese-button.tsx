"use client";

import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import { UpsertAnamneseForm } from "./upsert-anamnese-form";
import { ValidationErrorsModalProvider } from "@/components/ui/validation-errors-modal";

interface AddAnamneseButtonProps {
  onAnamneseUpsertSuccess: (anamneseId?: string | number) => void;
}

export default function AddAnamneseButton({ onAnamneseUpsertSuccess }: AddAnamneseButtonProps) {
  const t = useTranslations("AnamneseTable");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="default">
          <PlusCircle className="mr-2 size-4" />
          {t("add_anamnese_button")}
        </Button>
      </DialogTrigger>
      <ValidationErrorsModalProvider>
        <UpsertAnamneseForm
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSuccess={(anamneseId) => {
            setIsOpen(false);
            onAnamneseUpsertSuccess(anamneseId);
          }}
        />
      </ValidationErrorsModalProvider>
    </Dialog>
  );
}
