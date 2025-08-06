"use client";

import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

interface UpsertAnamneseButtonProps {
  onAnamneseUpsertSuccess: (anamneseId?: string | number) => void;
  onOpenForm: () => void; // Adicionar esta prop
}

export default function UpsertAnamneseButton({
  onAnamneseUpsertSuccess,
  onOpenForm, // Receber a nova prop
}: UpsertAnamneseButtonProps) {
  const t = useTranslations("AnamneseForm");

  return (
    <Button size="default" onClick={onOpenForm}> {/* Chamar onOpenForm no clique */}
      <PlusCircle className="mr-2 size-4" />
      {t("add_anamnese_button")}
    </Button>
  );
}
