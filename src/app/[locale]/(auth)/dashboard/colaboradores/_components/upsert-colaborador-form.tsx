'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, forwardRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { NumericFormat, PatternFormat } from "react-number-format";
import { Search, Loader2 } from "lucide-react";
import { useAction } from "@/hooks/use-action";
import { useFetchWithPopup } from "@/lib/fetchWithPopup";

import { upsertColaborador } from "@/actions/upsert-colaborador";
import { upsertColaboradorSchema } from "@/actions/upsert-colaborador/schema";
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useDebounce } from "use-debounce";
import { useAuth, useUser } from "@clerk/nextjs";
import { buildAbility, Action } from "@/lib/ability";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn as cn_utils } from "@/libs/utils";

import { useValidationErrorsModal } from "@/components/ui/validation-errors-modal";
// Interfaces e tipos
interface Colaborador {
  id?: string | number;
  organizationId?: string;
  name?: string;
  email?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  telefone?: string;
  celular?: string;
  cpf?: string;
  rg?: string;
  ctps?: string;
  data_admissao?: Date;
  data_demissao?: Date;
  data_nascimento?: Date;
  phoneNumber?: string;
  sex?: "male" | "female";
  createdAt?: Date;
  updatedAt?: Date;
}

interface UpsertColaboradorFormProps {
  initialData?: Colaborador;
  isOpen: boolean;
  onSuccess: (colaboradorId?: string | number) => void;
  onClose: () => void;
}

// Component personalizado para inputs numéricos
const CustomNumericInput = forwardRef<HTMLInputElement, any>(
  ({ className, allowLeadingZeros, format, mask, onValueChange, customInput, ...rest }, ref) => {
    return <Input className={className} ref={ref} {...rest} />;
  },
);

CustomNumericInput.displayName = "CustomNumericInput";

export function UpsertColaboradorForm({
  initialData,
  isOpen,
  onSuccess,
  onClose,
}: UpsertColaboradorFormProps) {
  const { execute, isLoading: isSubmitting } = useAction(upsertColaborador, {
    onSuccess: (data) => {
      toast.success(initialData ? 'Colaborador atualizado' : 'Colaborador criado');
      onSuccess(data.id); // Passa o ID do colaborador salvo
    },
    onError: (error) => {
      openValidationErrorsModal([error.message]);
    },
  });

  const { orgId } = useAuth();
  const { user } = useUser();
  const role = user?.publicMetadata?.role as string;
  const ability = buildAbility(role, orgId ?? undefined); 

  const form = useForm<z.infer<typeof upsertColaboradorSchema>>({
    resolver: zodResolver(upsertColaboradorSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          data_admissao: initialData.data_admissao ? new Date(initialData.data_admissao) : undefined,
          data_demissao: initialData.data_demissao ? new Date(initialData.data_demissao) : undefined,
          data_nascimento: initialData.data_nascimento ? new Date(initialData.data_nascimento) : undefined,
          createdAt: initialData.createdAt ? new Date(initialData.createdAt) : undefined,
          updatedAt: initialData.updatedAt ? new Date(initialData.updatedAt) : undefined,
        }
      : {
          name: "",
          email: "",
          phoneNumber: "",
          sex: null,
          endereco: "",
          numero: "",
          complemento: "",
          bairro: "",
          cidade: "",
          uf: "",
          cep: "",
          telefone: "",
          celular: "",
          cpf: "",
          rg: "",
          ctps: "",
          data_admissao: null,
          data_demissao: null,
          data_nascimento: null,
        },
  });

  // Watches para campos específicos
  const cepValue = form.watch("cep");
  const enderecoValue = form.watch("endereco");

  const [debouncedCep] = useDebounce(cepValue, 500);

  useEffect(() => {
    const fetchAddress = async () => {
      // Condição: CEP preenchido (8 dígitos) E Endereço vazio
      if (
        debouncedCep &&
        debouncedCep.replace(/\D/g, "").length === 8 &&
        !enderecoValue
      ) {
        try {
          const response = await fetch(
            `https://viacep.com.br/ws/${debouncedCep.replace(/\D/g, "")}/json/`,
          );
          const data = await response.json();

          if (!data.erro) {
            form.setValue("endereco", data.logradouro.toUpperCase());
            form.setValue("bairro", data.bairro.toUpperCase());
            form.setValue("cidade", data.localidade.toUpperCase());
            form.setValue("uf", data.uf.toUpperCase());
            form.setValue("cep", data.cep); // Atualiza o próprio campo CEP
          } else {
            toast.error("CEP não encontrado.");
          }
        } catch (error) {
          toast.error("Erro ao buscar CEP.");
        }
      }
    };

    fetchAddress();
  }, [debouncedCep, form, enderecoValue]);

  const openValidationErrorsModal = useValidationErrorsModal();

  const onSubmit = async (values: z.infer<typeof upsertColaboradorSchema>) => {
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
        className="max-h-[90vh] w-full max-w-5xl min-h-[70vh] flex flex-col"
      >
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Colaborador" : "Novo Colaborador"}
          </DialogTitle>
          <DialogDescription>
            Preencha os campos para adicionar ou editar um colaborador.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}
            className="flex h-full w-full flex-1 flex-col overflow-hidden"
          >
            <Tabs
              defaultValue="geral"
              className="flex w-full flex-1 flex-col"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="geral">Geral</TabsTrigger>
                <TabsTrigger value="endereco">Endereço</TabsTrigger>
                <TabsTrigger value="outros">Outros Dados</TabsTrigger>
              </TabsList>
              <div className="flex-1 overflow-y-auto p-4">
                <TabsContent value="geral" className="mt-0 space-y-4">
                  <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nome do Colaborador"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(e.target.value.toUpperCase())
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sex"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sexo</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
                                <SelectValue placeholder="Selecione o sexo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="masculino">Masculino</SelectItem>
                              <SelectItem value="feminino">Feminino</SelectItem>
                              <SelectItem value="outro">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
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
                              customInput={CustomNumericInput}
                              placeholder="000.000.000-00"
                              allowLeadingZeros={true}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="rg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RG</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="RG"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(e.target.value.toUpperCase())
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ctps"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CTPS</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="CTPS"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(e.target.value.toUpperCase())
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="data_nascimento"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data de Nascimento</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn_utils(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Selecione uma data</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value || undefined}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() ||
                                  date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Sua data de nascimento.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="data_admissao"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data de Admissão</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn_utils(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Selecione uma data</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value || undefined}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() ||
                                  date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="data_demissao"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data de Demissão</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn_utils(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Selecione uma data</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value || undefined}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() ||
                                  date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="endereco" className="mt-0 space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                    <FormField
                      control={form.control}
                      name="cep"
                      render={({ field }) => (
                        <FormItem className="col-span-12 md:col-span-2">
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
                        <FormItem className="col-span-12 md:col-span-8">
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Endereço"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(e.target.value.toUpperCase())
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="numero"
                      render={({ field }) => (
                        <FormItem className="col-span-12 md:col-span-2">
                          <FormLabel>Número</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Número"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(e.target.value.toUpperCase())
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                    <FormField
                      control={form.control}
                      name="complemento"
                      render={({ field }) => (
                        <FormItem className="col-span-12 md:col-span-3">
                          <FormLabel>Complemento</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Complemento"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(e.target.value.toUpperCase())
                              }
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
                        <FormItem className="col-span-12 md:col-span-3">
                          <FormLabel>Bairro</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Bairro"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(e.target.value.toUpperCase())
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cidade"
                      render={({ field }) => (
                        <FormItem className="col-span-12 md:col-span-4">
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Cidade"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(e.target.value.toUpperCase())
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="uf"
                      render={({ field }) => (
                        <FormItem className="col-span-12 md:col-span-2">
                          <FormLabel>UF</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="UF"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) =>
                                field.onChange(e.target.value.toUpperCase())
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="outros" className="mt-0 space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone Principal</FormLabel>
                          <FormControl>
                            <PatternFormat
                              format="(##) #####-####"
                              mask="_"
                              value={field.value}
                              onValueChange={(values) => {
                                field.onChange(values.formattedValue);
                              }}
                              customInput={Input}
                              placeholder="(00) 00000-0000"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="telefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone Fixo</FormLabel>
                          <FormControl>
                            <PatternFormat
                              format="(##) ####-####"
                              mask="_"
                              value={field.value}
                              onValueChange={(values) => {
                                field.onChange(values.formattedValue);
                              }}
                              customInput={Input}
                              placeholder="(00) 0000-0000"
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
                          <FormLabel>Celular Adicional</FormLabel>
                          <FormControl>
                            <PatternFormat
                              format="(##) #####-####"
                              mask="_"
                              value={field.value}
                              onValueChange={(values) => {
                                field.onChange(values.formattedValue);
                              }}
                              customInput={Input}
                              placeholder="(00) 00000-0000"
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
                          <Input placeholder="Email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </div>
            </Tabs>
            <DialogFooter className="border-t pt-4">
              <Button
                type="button"
                variant="destructive"
                onClick={onClose}
                className="w-35"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : initialData ? (
                  "Salvar Alterações"
                ) : (
                  "Criar Colaborador"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

