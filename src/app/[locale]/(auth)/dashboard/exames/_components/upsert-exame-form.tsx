"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { NumericFormat } from "react-number-format";
import { Loader2 } from "lucide-react";
import { useAction } from "@/hooks/use-action";
import { z } from "zod";

import { upsertExame } from "@/actions/upsert-exame";
import { upsertExameSchema } from "@/actions/upsert-exame/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAuth, useUser } from "@clerk/nextjs";
import { buildAbility, Action } from "@/lib/ability";

import { useValidationErrorsModal } from "@/components/ui/validation-errors-modal";

// Função para validar se uma string é um UUID
const isUuid = (value: string | null | undefined): boolean => {
  if (!value) return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

interface Exame {
  id?: string | number;
  organizationId?: string;
  descricao?: string;
  validade?: number;
  validade1?: number;
  valor?: number;
  pedido?: "Sim" | "Não";
  codigo_anterior?: string;
  tipo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UpsertExameFormProps {
  initialData?: Exame;
  isOpen: boolean;
  onSuccess: (exameId?: string | number) => void;
  onClose: () => void;
}

const UpsertExameForm = ({
  initialData,
  isOpen,
  onSuccess,
  onClose,
}: UpsertExameFormProps) => {
  const { orgId } = useAuth();
  const { user } = useUser();
  const role = user?.publicMetadata?.role as string;
  const ability = buildAbility(role, orgId ?? undefined);
  const canEditExame = ability.can(Action.Update, "Exame");

  const form = useForm({
    resolver: zodResolver(upsertExameSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          organizationId: isUuid(initialData.organizationId)
            ? initialData.organizationId
            : undefined,
          createdAt: initialData.createdAt ? new Date(initialData.createdAt) : undefined,
          updatedAt: initialData.updatedAt ? new Date(initialData.updatedAt) : undefined,
        }
      : {
          descricao: "",
          validade: 0,
          validade1: 0,
          valor: 0,
          pedido: "Não",
          codigo_anterior: "",
          tipo: "ADMISSIONAL",
          organizationId: initialData
            ? (isUuid(initialData.organizationId) ? initialData.organizationId : undefined)
            : (orgId === "" ? undefined : orgId), // Garante que seja um UUID válido ou undefined, tratando string vazia
        },
  });

  const { execute, status } = useAction(upsertExame, {
    onSuccess: (data) => {
      toast.success(initialData ? "Exame atualizado" : "Exame criado");
      onSuccess(data.id);
    },
    onError: ({ serverError }) => {
      openValidationErrorsModal([serverError || "Erro inesperado ao salvar exame."]);
    },
  });

  useEffect(() => {
    // console.log("Formulário de Exames - Erros de validação:", form.formState.errors);
  }, [form.formState.errors]);

  const openValidationErrorsModal = useValidationErrorsModal();

  const onSubmit = (values: z.infer<typeof upsertExameSchema>) => {
    execute(values);
  };

  const onInvalid = (errors: typeof form.formState.errors) => {
    const errorMessages: string[] = [];
    for (const fieldName in errors) {
      const error = errors[fieldName as keyof typeof errors];
      if (error && error.message) {
        errorMessages.push(error.message);
      }
    }
    openValidationErrorsModal(errorMessages);
  };

    return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        hideCloseButton
        onInteractOutside={(e) => e.preventDefault()}
        className="flex h-full max-h-[90vh] w-full max-w-2xl flex-col"
      >
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Exame" : "Novo Exame"}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Preencha os campos para adicionar ou editar um exame.
        </DialogDescription>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}
            className="flex h-full w-full flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Descrição do Exame"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                        disabled={!canEditExame}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 w-full md:grid-cols-4">
                <FormField
                  control={form.control}
                  name="validade"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Validade Adm.</FormLabel>
                      <FormControl>
                        <NumericFormat
                          value={field.value}
                          onValueChange={(values) => {
                            field.onChange(values.floatValue);
                          }}
                          decimalScale={0}
                          allowNegative={false}
                          customInput={Input}
                          placeholder="Validade em meses"
                          disabled={!canEditExame}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="validade1"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Validade Per.</FormLabel>
                      <FormControl>
                        <NumericFormat
                          value={field.value}
                          onValueChange={(values) => {
                            field.onChange(values.floatValue);
                          }}
                          decimalScale={0}
                          allowNegative={false}
                          customInput={Input}
                          placeholder="Validade Periódico em meses"
                          disabled={!canEditExame}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="valor"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Valor</FormLabel>
                      <FormControl>
                        <NumericFormat
                          value={field.value}
                          onValueChange={(values) => {
                            field.onChange(values.floatValue);
                          }}
                          decimalScale={2}
                          fixedDecimalScale
                          decimalSeparator=","
                          allowNegative={false}
                          allowLeadingZeros={false}
                          thousandSeparator="."
                          customInput={Input}
                          prefix="R$"
                          disabled={!canEditExame}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pedido"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Faturar?</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!canEditExame}
                      >
                        <FormControl>
                          <SelectTrigger className="border border-input">
                            <SelectValue placeholder="Selecione se é pedido" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Sim">Sim</SelectItem>
                          <SelectItem value="Não">Não</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="codigo_anterior"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código Anterior</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Código Sistema Anterior"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                        disabled={!canEditExame}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="border-t pt-4">
              <Button
                type="button"
                variant="destructive"
                onClick={onClose}
                className="w-35"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={status === "executing" || !canEditExame}
              >
                {status === "executing" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : initialData ? (
                  "Salvar Alterações"
                ) : (
                  "Criar Exame"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertExameForm;