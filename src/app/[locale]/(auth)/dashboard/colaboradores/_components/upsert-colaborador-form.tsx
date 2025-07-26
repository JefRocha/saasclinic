'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, forwardRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { NumericFormat, PatternFormat } from "react-number-format";
import { Search, Loader2 } from "lucide-react";
import { useAction } from "@/hooks/use-action";
import { useFetchWithPopup } from "@/lib/fetchWithPopup"; // Assuming this is still needed for other fetches

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
import { cn as cn_utils } from "@/libs/utils"; // Renomeado para evitar conflito com cn de tailwind-merge

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
  situacao?: string;
  obs1?: string;
  data_nascimento?: Date;
  setor?: string;
  cargahoraria?: string;
  prontuario?: string;
  observacao?: string;
  pcd?: string;
  cod_anterior?: string;
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

// Component personalizado para inputs numéricos (se necessário, adapte)
const CustomNumericInput = forwardRef<HTMLInputElement, any>(
  ({ className, ...props }, ref) => {
    return <Input className={className} ref={ref} {...props} />;
  },
);

CustomNumericInput.displayName = "CustomNumericInput";

const UpsertColaboradorForm = ({
  initialData,
  isOpen,
  onSuccess,
  onClose,
}: UpsertColaboradorFormProps) => {
  const { execute, isLoading: isSubmitting } = useAction(upsertColaborador, {
    onSuccess: (data) => {
      toast.success(initialData ? 'Colaborador atualizado' : 'Colaborador criado');
      onSuccess(data.id); // Passa o ID do colaborador salvo
      onClose();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { orgId } = useAuth();
  const { user } = useUser();
  const role = user?.publicMetadata?.role as string;
  const ability = buildAbility(role, orgId ?? undefined);
  // Adapte as permissões conforme necessário para colaborador
  const canEditSituacao = ability.can(Action.Update, "Colaborador", "situacao"); 

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
          sex: undefined,
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
          data_admissao: undefined,
          data_demissao: undefined,
          situacao: "",
          obs1: "",
          data_nascimento: undefined,
          setor: "",
          cargahoraria: "",
          prontuario: "",
          observacao: "",
          pcd: "",
          cod_anterior: "",
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

  const onSubmit = async (values: z.infer<typeof upsertColaboradorSchema>) => {
    execute(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        hideCloseButton
        onInteractOutside={(e) => e.preventDefault()}
        className="max-h-[90vh] w-full max-w-5xl overflow-y-auto"
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
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-4"
          >
            <Tabs defaultValue="geral" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="geral">Geral</TabsTrigger>
                <TabsTrigger value="endereco">Endereço</TabsTrigger>
                <TabsTrigger value="outros">Outros Dados</TabsTrigger>
              </TabsList>
              <TabsContent value="geral" className="space-y-4 py-4">
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
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o sexo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Masculino</SelectItem>
                            <SelectItem value="female">Feminino</SelectItem>
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
                                  "w-[240px] pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
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
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
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
                                  "w-[240px] pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
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
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
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
                                  "w-[240px] pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
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
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
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
                <FormField
                  control={form.control}
                  name="situacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Situação</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Situação"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())}
                          disabled={!canEditSituacao}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="endereco" className="space-y-4 py-4">
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

              <TabsContent value="outros" className="space-y-4 py-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                </div>
                <FormField
                  control={form.control}
                  name="setor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Setor</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Setor"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cargahoraria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carga Horária</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Carga Horária"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="prontuario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prontuário</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Prontuário"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="observacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observação</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Observação"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pcd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PCD</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="PCD"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cod_anterior"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código Anterior</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Código Anterior"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter>
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

export default UpsertColaboradorForm;
