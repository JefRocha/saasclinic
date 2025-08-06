import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { UpsertAnamneseForm } from "./upsert-anamnese-form";
import { ValidationErrorsModalProvider } from "@/components/ui/validation-errors-modal";

interface UpsertAnamneseButtonProps {
  anamnese?: {
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
  };
  onAnamneseUpsertSuccess: (anamneseId?: string | number) => void;
  children?: React.ReactNode;
}

export default function UpsertAnamneseButton({
  anamnese,
  onAnamneseUpsertSuccess,
  children,
}: UpsertAnamneseButtonProps) {
  const t = useTranslations("AnamneseForm");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="default">
            <PlusCircle className="mr-2 size-4" />
            {t("add_anamnese_button")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="[&>button]:hidden w-full max-w-[1400px] overflow-y-auto focus:outline-none"
      >
        <DialogHeader>
          <DialogTitle>{t('form_title')}</DialogTitle>
        </DialogHeader>
        <ValidationErrorsModalProvider>
          <UpsertAnamneseForm
            initialData={anamnese}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            onSuccess={(anamneseId) => {
              setIsOpen(false);
              onAnamneseUpsertSuccess(anamneseId);
            }}
          />
        </ValidationErrorsModalProvider>
      </DialogContent>
    </Dialog>
  );
}
