"use client";


"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { NumericFormat, PatternFormat } from "react-number-format";
import { Loader2 } from "lucide-react";
import { useAction } from "@/hooks/use-action";
import { z } from "zod";

import { upsertMedico } from "@/actions/upsert-medico";
import { upsertMedicoSchema } from "@/actions/upsert-medico/schema";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth, useUser } from "@clerk/nextjs";
import { buildAbility, Action } from "@/lib/ability";
import { useDebounce } from "use-debounce";
import { useQuery } from "@tanstack/react-query";
import { getOrganizations } from "@/actions/get-organizations";

import { useValidationErrorsModal } from "@/components/ui/validation-errors-modal";

// Função para validar se uma string é um UUID
const isUuid = (value: string | null | undefined): boolean => {
  if (!value) return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

interface Medico {
  id?: string | number;
  organizationId?: string;
  nome?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  cpf?: string;
  telefone?: string;
  celular?: string;
  crm?: string;
  usaAgenda?: number;
  codAgenda?: number;
  numero?: string;
  complemento?: string;
  codiIbge?: number;
  email?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UpsertMedicoFormProps {
  initialData?: Medico;
  isOpen: boolean;
  onSuccess: (medicoId?: string | number) => void;
  onClose: () => void;
}

const UpsertMedicoForm = ({
  initialData,
  isOpen,
  onSuccess,
  onClose,
}: UpsertMedicoFormProps) => {
  const { orgId } = useAuth();
  const { user } = useUser();
  const role = user?.publicMetadata?.role as string;
  const ability = buildAbility(role, orgId ?? undefined);
  const canEditMedico = ability.can(Action.Update, "Medico");

  const { data: organizations, isLoading: isLoadingOrganizations } = useQuery({
    queryKey: ["organizations"],
    queryFn: () => getOrganizations({}),
  });

  const form = useForm({
    resolver: zodResolver(upsertMedicoSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          organizationId: isUuid(initialData.organizationId)
            ? initialData.organizationId
            : undefined,
          createdAt: initialData.createdAt
            ? new Date(initialData.createdAt)
            : undefined,
          updatedAt: initialData.updatedAt
            ? new Date(initialData.updatedAt)
            : undefined,
          usaAgenda: initialData.usaAgenda === 1 ? 1 : 0, // Garante 0 ou 1
        }
      : {
          nome: "",
          endereco: "",
          bairro: "",
          cidade: "",
          uf: "",
          cep: "",
          cpf: "",
          telefone: "",
          celular: "",
          crm: "",
          usaAgenda: 0,
          codAgenda: null,
          numero: "",
          complemento: "",
          codiIbge: null,
          email: "",
          organizationId: role === "super_admin" ? "" : orgId, // Define orgId padrão para não-super_admin
        },
  });

  const { execute, status } = useAction(upsertMedico, {
    onSuccess: (data) => {
      toast.success(initialData ? "Médico atualizado" : "Médico criado");
      onSuccess(data.id);
    },
    onError: ({ serverError }) => {
      openValidationErrorsModal([serverError || "Erro inesperado ao salvar médico."]);
    },
  });

  // Watches para campos específicos
  const cepValue = form.watch("cep");
  const [debouncedCep] = useDebounce(cepValue, 500);

  useEffect(() => {
    // console.log("Formulário de Médicos - Erros de validação:", form.formState.errors);
  }, [form.formState.errors]);

  useEffect(() => {
    const fetchAddress = async () => {
      if (debouncedCep && debouncedCep.replace(/\D/g, "").length === 8) {
        try {
          const response = await fetch(
            `https://viacep.com.br/ws/${debouncedCep.replace(
              /\D/g,
              ""
            )}/json/`
          );
          const data = await response.json();

          if (!data.erro) {
            form.setValue("endereco", data.logradouro.toUpperCase());
            form.setValue("bairro", data.bairro.toUpperCase());
            form.setValue("cidade", data.localidade.toUpperCase());
            form.setValue("uf", data.uf.toUpperCase());
            form.setValue("cep", data.cep); // Atualiza o próprio campo CEP
            form.setValue("codiIbge", Number(data.ibge));
          } else {
            toast.error("CEP não encontrado.");
          }
        } catch (error) {
          toast.error("Erro ao buscar CEP.");
        }
      }
    };

    fetchAddress();
  }, [debouncedCep, form]);

  const openValidationErrorsModal = useValidationErrorsModal();

  const onSubmit = (values: z.infer<typeof upsertMedicoSchema>) => {
    console.log("Form values before execute - organizationId:", form.getValues("organizationId"));
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
        className="flex h-full max-h-[90vh] w-full max-w-5xl flex-col"
      >
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Médico" : "Novo Médico"}
          </DialogTitle>
          <DialogDescription>
            Preencha os campos para adicionar ou editar um médico.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}
            className="flex h-full w-full flex-1 flex-col overflow-hidden"
          >
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome do Médico"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                        disabled={!canEditMedico}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {role === "super_admin" && (
                <FormField
                  control={form.control}
                  name="organizationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organização</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          console.log("Select onValueChange - value:", value);
                          field.onChange(value);
                        }}
                        value={field.value || ""}
                        disabled={isLoadingOrganizations}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma organização" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {organizations?.data?.data?.map((org: any) => {
                            return (
                              <SelectItem key={org.id} value={org.id}>
                                {org.nome}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <PatternFormat
                          format="###.###.###-##"
                          mask="_"
                          value={field.value || ""}
                          onValueChange={(values) => {
                            field.onChange(values.value);
                          }}
                          customInput={Input}
                          placeholder="000.000.000-00"
                          disabled={!canEditMedico}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="crm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CRM</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="CRM"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())
                          }
                          disabled={!canEditMedico}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
                <FormField
                  control={form.control}
                  name="cep"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <PatternFormat
                          format="#####-###"
                          mask="_"
                          value={field.value}
                          onValueChange={(values) => {
                            field.onChange(values.formattedValue);
                          }}
                          customInput={Input}
                          placeholder="00000-000"
                          disabled={!canEditMedico}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endereco"
                  render={({ field }) => (
                    <FormItem className="col-span-5">
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Endereço"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())
                          }
                          disabled={!canEditMedico}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="numero"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Número"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())
                          }
                          disabled={!canEditMedico}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="complemento"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Complemento"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())
                          }
                          disabled={!canEditMedico}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bairro"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Bairro"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())
                          }
                          disabled={!canEditMedico}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="uf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UF</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="UF"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())
                          }
                          disabled={!canEditMedico}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="codiIbge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código IBGE</FormLabel>
                      <FormControl>
                        <NumericFormat
                          value={field.value}
                          onValueChange={(values) => {
                            field.onChange(values.floatValue);
                          }}
                          decimalScale={0}
                          allowNegative={false}
                          customInput={Input}
                          placeholder="Código IBGE"
                          disabled={!canEditMedico}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <NumericFormat
                          format="(##) ####-####"
                          mask="_"
                          value={field.value}
                          onValueChange={(values) => {
                            field.onChange(values.formattedValue);
                          }}
                          customInput={Input}
                          placeholder="(00) 0000-0000"
                          disabled={!canEditMedico}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="celular"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Celular</FormLabel>
                      <FormControl>
                        <NumericFormat
                          format="(##) #####-####"
                          mask="_"
                          value={field.value}
                          onValueChange={(values) => {
                            field.onChange(values.formattedValue);
                          }}
                          customInput={Input}
                          placeholder="(00) 00000-0000"
                          disabled={!canEditMedico}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Email"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(e.target.value.toLowerCase())
                        }
                        disabled={!canEditMedico}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="usaAgenda"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Usa Agenda?</FormLabel>
                      <FormDescription>
                        Define se o médico utiliza a agenda do sistema.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value === 1}
                        onCheckedChange={(checked) =>
                          field.onChange(checked ? 1 : 0)
                        }
                        disabled={!canEditMedico}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("usaAgenda") === 1 && (
                <FormField
                  control={form.control}
                  name="codAgenda"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código Agenda</FormLabel>
                      <FormControl>
                        <NumericFormat
                          value={field.value}
                          onValueChange={(values) => {
                            field.onChange(values.floatValue);
                          }}
                          decimalScale={0}
                          allowNegative={false}
                          customInput={Input}
                          placeholder="Código da Agenda"
                          disabled={!canEditMedico}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
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
                disabled={status === "executing" || !canEditMedico}
              >
                {status === "executing" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : initialData ? (
                  "Salvar Alterações"
                ) : (
                  "Criar Médico"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertMedicoForm;
