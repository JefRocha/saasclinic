// Reescrevendo o formulário para usar a rota da API REST
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { upsertClientSchema } from "@/actions/upsert-client/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface UpsertClientFormProps {
  initialData?: any; // substitua por tipo correto se tiver
  isOpen: boolean;
  onSuccess: () => void;
}

const UpsertClientForm = ({ initialData, isOpen, onSuccess }: UpsertClientFormProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(upsertClientSchema),
    defaultValues: initialData || {
      razaoSocial: "",
      cpf: "",
      pessoa: "J",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const onSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.message || "Erro ao salvar cliente.");
        return;
      }

      toast.success(initialData ? "Cliente atualizado" : "Cliente criado");
      form.reset();
      onSuccess();
    } catch (err) {
      toast.error("Erro inesperado ao salvar cliente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          <DialogDescription>
            Preencha os campos obrigatórios e clique em salvar.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Input {...form.register("razaoSocial")} placeholder="Razão Social" />
            <Input {...form.register("cpf")} placeholder="CPF ou CNPJ" />
            <Input {...form.register("pessoa")} placeholder="Tipo Pessoa (J ou F)" />
            <DialogFooter>
              <Button type="button" variant="destructive" onClick={onSuccess}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : initialData ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertClientForm;
