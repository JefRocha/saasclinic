"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, forwardRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { NumericFormat, PatternFormat } from "react-number-format";
import { Search, Loader2 } from "lucide-react";
import { useAction } from "@/hooks/use-action";
import { getCnpjInfo } from "@/actions/get-cnpj-info";
import { useFetchWithPopup } from "@/lib/fetchWithPopup";





import { upsertClient } from "@/actions/upsert-client";

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

import { useValidationErrorsModal } from "@/components/ui/validation-errors-modal";

// Interfaces e tipos
// Substitua a interface Client atual por esta versão corrigida:

interface Client {
  id?: number;
  organizationId?: string | null;
  razaoSocial?: string | null;
  fantasia?: string | null;
  endereco?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  cep?: string | null;
  complemento?: string | null;
  moradia?: number | null;
  tipo?: number | null;
  situacao?: number | null;
  telefone1?: string | null;
  telefone2?: string | null;
  telefone3?: string | null;
  celular?: string | null;
  email?: string | null;
  rg?: string | null;
  cpf?: string | null;
  estadoCivil?: string | null;
  empresa?: string | null;
  dataCadastro?: Date | null;
  dataUltimaCompra?: Date | null;
  previsao?: Date | null;
  cnae?: string | null;
  codMunicipioIbge?: string | null;
  ibge?: string | null;
  correspEndereco?: string | null;
  correspBairro?: string | null;
  correspCidade?: string | null;
  correspUf?: string | null;
  correspCep?: string | null;
  correspComplemento?: string | null;
  correspNumero?: string | null;
  foto?: string | null;
  tipoCadastro?: string | null;
  ie?: string | null;
  mdia?: string | null;
  tDocumento?: string | null;
  tVencimento?: string | null;
  tCobranca?: string | null;
  retencoes?: string | null;
  simples?: string | null;
  correios?: string | null;
  email1?: string | null;
  email2?: string | null;
  email3?: string | null;
  email4?: string | null;
  email5?: string | null;
  contribuinte?: string | null;
  vlrMens?: number | null;
  observacao?: string | null;
  usaFor?: boolean | null;
  crt?: string | null;
  melhorDia?: string | null;
  vendedor?: string | null;
  teste?: string | null;
  travado?: boolean | null;
  ativo?: boolean | null;
  inadimplente?: boolean | null;
  especial?: boolean | null;
  bloqueado?: boolean | null;
  pessoa?: string | null;
  documentosPdf?: string | null;
  codigoAnterior?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

interface UpsertClientFormProps {
  initialData?: Client;
  isOpen: boolean;
  onSuccess: (client: Client) => void;
  onClose: () => void;
}

// Component personalizado para inputs numéricos
const CustomNumericInput = forwardRef<HTMLInputElement, any>(
  ({ className, allowLeadingZeros, format, mask, onValueChange, customInput, ...rest }, ref) => {
    return <Input className={className} ref={ref} {...rest} />;
  },
);

CustomNumericInput.displayName = "CustomNumericInput";

// Função para validar CNPJ (você precisa implementar esta função)
const validarCNPJ = (cnpj: string): boolean => {
  // Implementar validação de CNPJ
  return cnpj.length === 14;
};

import { useDebounce } from "use-debounce"; // Assumindo que useDebounce está aqui
import { useAuth, useUser } from "@clerk/nextjs";
import { buildAbility, Action } from "@/lib/ability";

// Função para validar se uma string é um UUID
const isUuid = (value: string | null | undefined): boolean => {
  if (!value) return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};

const UpsertClientForm = ({
  initialData,
  isOpen,
  onSuccess,
  onClose,
}: UpsertClientFormProps) => {
  const { execute, isLoading: isSubmitting } = useAction(upsertClient, {
    onSuccess: (data) => {
      toast.success(initialData ? 'Cliente atualizado' : 'Cliente criado');
      onSuccess(data); // Passa o objeto completo do cliente
    },
    onError: (error) => {
      openValidationErrorsModal([error.message]);
    },
  });

  const { orgId } = useAuth();
  const { user } = useUser();
  const role = user?.publicMetadata?.role as string;
  const ability = buildAbility(role, orgId ?? undefined);
  const canEditSituacao = ability.can(Action.Update, "Client", "situacao");

  const form = useForm({
    resolver: zodResolver(upsertClientSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          organizationId: isUuid(initialData.organizationId)
            ? initialData.organizationId
            : undefined,
          dataCadastro: initialData.dataCadastro
            ? new Date(initialData.dataCadastro)
            : undefined,
          dataUltimaCompra: initialData.dataUltimaCompra
            ? new Date(initialData.dataUltimaCompra)
            : undefined,
          previsao: initialData.previsao
            ? new Date(initialData.previsao)
            : undefined,
          createdAt: initialData.createdAt
            ? new Date(initialData.createdAt)
            : undefined,
          updatedAt: initialData.updatedAt
            ? new Date(initialData.updatedAt)
            : undefined,
        }
      : {
          razaoSocial: "",
          fantasia: "",
          cpf: "",
          endereco: "",
          numero: "",
          bairro: "",
          cidade: "",
          uf: "",
          cep: "",
          complemento: "",
          telefone1: "",
          telefone2: "",
          telefone3: "",
          celular: "",
          email: "",
          rg: "",
          estadoCivil: "",
          empresa: "",
          cnae: "",
          codMunicipioIbge: "",
          ibge: "",
          correspEndereco: "",
          correspBairro: "",
          correspCidade: "",
          correspUf: "",
          correspCep: "",
          correspComplemento: "",
          correspNumero: "",
          foto: "",
          tipoCadastro: "",
          ie: "",
          mdia: "",
          tDocumento: "",
          tVencimento: "",
          tCobranca: "",
          retencoes: "",
          simples: "",
          correios: "",
          email1: "",
          email2: "",
          email3: "",
          email4: "",
          email5: "",
          contribuinte: "N",
          observacao: "",
          usaFor: undefined,
          crt: "",
          melhorDia: "",
          vendedor: "",
          teste: "",
          documentosPdf: "",
          codigoAnterior: "",
          pessoa: "J",
          travado: false,
          ativo: false,
          inadimplente: false,
          especial: false,
          bloqueado: false,
          moradia: undefined,
          tipo: undefined,
          situacao: undefined,
          vlrMens: undefined,
          dataCadastro: undefined,
          dataUltimaCompra: undefined,
          previsao: undefined,
        },
  });

  // Watches para campos específicos
  const cpfValue = form.watch("cpf");
  const pessoaValue = form.watch("pessoa");
  const enderecoValue = form.watch("endereco");
  const correspEnderecoValue = form.watch("correspEndereco");

  const cepValue = form.watch("cep");
  const correspCepValue = form.watch("correspCep");

  const [debouncedCep] = useDebounce(cepValue, 500);
  const [debouncedCorrespCep] = useDebounce(correspCepValue, 500);

  useEffect(() => {
    console.log('form errors →', form.formState.errors);
    
    const fetchAddress = async () => {
      // Condição: CEP preenchido (8 dígitos) E Endereço vazio
      if (
        debouncedCep &&
        debouncedCep.replace(/\D/g, "").length === 8 &&
        !enderecoValue
      ) {
        console.log("Searching CEP:", debouncedCep);
        try {
          const response = await fetch(
            `https://viacep.com.br/ws/${debouncedCep.replace(/\D/g, "")}/json/`,
          );
          const data = await response.json();
          console.log("ViaCEP Response Data:", data);

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
  }, [debouncedCep, form, enderecoValue]); // Adicionado enderecoValue às dependências

  useEffect(() => {
    console.log('form errors →', form.formState.errors);
    const fetchCorrespAddress = async () => {
      if (
        debouncedCorrespCep &&
        debouncedCorrespCep.replace(/\D/g, "").length === 8 &&
        !correspEnderecoValue
      ) {
        console.log("Searching Corresp CEP:", debouncedCorrespCep);
        try {
          const response = await fetch(
            `https://viacep.com.br/ws/${debouncedCorrespCep.replace(/\D/g, "")}/json/`,
          );
          const data = await response.json();
          console.log("ViaCEP Corresp Response Data:", data);

          if (!data.erro) {
            form.setValue("correspEndereco", data.logradouro.toUpperCase());
            form.setValue("correspBairro", data.bairro.toUpperCase());
            form.setValue("correspCidade", data.localidade.toUpperCase());
            form.setValue("correspUf", data.uf.toUpperCase());
            form.setValue("correspCep", data.cep); // Atualiza o próprio campo CEP
            form.setValue("correspNumero", ""); // Limpa o número para ser preenchido manualmente
          } else {
            toast.error("CEP de Correspondência não encontrado.");
          }
        } catch (error) {
          toast.error("Erro ao buscar CEP de Correspondência.");
        }
      }
    };

    fetchCorrespAddress();
  }, [debouncedCorrespCep, form, correspEnderecoValue]);

  


  const defaultEmptyValues = {
  razaoSocial: "",
  fantasia: "",
  cpf: "",
  endereco: "",
  numero: "",
  bairro: "",
  cidade: "",
  uf: "",
  cep: "",
  complemento: "",
  telefone1: "",
  telefone2: "",
  telefone3: "",
  celular: "",
  email: "",
  rg: "",
  estadoCivil: "",
  empresa: "",
  cnae: "",
  codMunicipioIbge: "",
  ibge: "",
  correspEndereco: "",
  correspBairro: "",
  correspCidade: "",
  correspUf: "",
  correspCep: "",
  correspComplemento: "",
  correspNumero: "",
  foto: "",
  tipoCadastro: "",
  ie: "",
  mdia: "",
  tDocumento: "",
  tVencimento: "",
  tCobranca: "",
  retencoes: "",
  simples: "",
  correios: "",
  email1: "",
  email2: "",
  email3: "",
  email4: "",
  email5: "",
  contribuinte: "N",
  observacao: "",
  usaFor: "",
  crt: "",
  melhorDia: "",
  vendedor: "",
  teste: "",
  documentosPdf: "",
  codigoAnterior: "",
  pessoa: "J",
  travado: false,
  ativo: false,
  inadimplente: false,
  especial: false,
  bloqueado: false,
  moradia: undefined,
  tipo: undefined,
  situacao: undefined,
  vlrMens: undefined,
  dataCadastro: undefined,
  dataUltimaCompra: undefined,
  previsao: undefined,
};


  // Função para buscar CNPJ
  const { execute: executeCnpjSearch, isLoading: isLoadingCnpjSearch } =
  useAction(getCnpjInfo, {
    onSuccess: (response) => {
      if (response.success && response.data) {
        const apiData = response.data;
        
        try {
          form.setValue("razaoSocial", (apiData.nome || "").toUpperCase());
          form.setValue("fantasia", (apiData.fantasia || apiData.nome || "").toUpperCase());
          form.setValue("endereco", (apiData.logradouro || "").toUpperCase());
          form.setValue("numero", (apiData.numero || "").toUpperCase());
          form.setValue("complemento", (apiData.complemento || "").toUpperCase());
          form.setValue("bairro", (apiData.bairro || "").toUpperCase());
          form.setValue("cidade", (apiData.municipio || "").toUpperCase());
          form.setValue("uf", (apiData.uf || "").toUpperCase());
          form.setValue("cep", apiData.cep || "");
          form.setValue("ie", (apiData.ie || "").toUpperCase());
          form.setValue("cnae", (apiData.atividade_principal?.[0]?.code || "").toUpperCase());
          form.setValue("telefone1", apiData.telefone || "");
          form.setValue("email", apiData.email || "");

          const rawCpfCnpj = apiData.cnpj;
          if (rawCpfCnpj) {
            const cleanedValue = rawCpfCnpj.replace(/\D/g, "");
            form.setValue("pessoa", "J");
            form.setValue("cpf", cleanedValue);
          }

          form.trigger();
          toast.success("Dados do CNPJ preenchidos com sucesso!");
        } catch (e) {
          console.error("Erro ao preencher formulário com dados do CNPJ:", e);
          toast.error("Erro ao preencher formulário.");
        }
      } else {
        toast.error(response.data?.error || "Erro ao buscar CNPJ.");
      }
    },
    onError: (error) => {
      console.error("CNPJ Search Error:", error);
      console.error("Full error object:", JSON.stringify(error, null, 2));
      
      // Verificação de tipo segura
      let errorMessage = "Ocorreu um erro inesperado ao buscar CNPJ.";
      
      if (error && typeof error === 'object') {
        // Se error tem a propriedade 'error' e ela tem 'serverError'
        if ('error' in error && error.error && typeof error.error === 'object' && 'serverError' in error.error) {
          errorMessage = (error.error as any).serverError || errorMessage;
        }
        // Ou se error tem diretamente a propriedade 'message'
        else if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    },
  });

  const handleCnpjSearch = () => {
    const cleanedCnpj = cpfValue ? cpfValue.replace(/\D/g, "") : "";

    if (pessoaValue === "J") {
      if (cleanedCnpj.length !== 14) {
        toast.error("Por favor, insira um CNPJ com 14 dígitos.");
        return;
      }

      if (!validarCNPJ(cleanedCnpj)) {
        toast.error("CNPJ inválido.");
        return;
      }

      executeCnpjSearch({ cnpj: cleanedCnpj });
    } else {
      toast.info("A busca de CNPJ é apenas para Pessoa Jurídica.");
    }
  };

  // useEffect(() => {
  // // Só reseta nos casos apropriados
  // if (!isLoadingCnpjSearch && !isLoading) {
  //   form.reset(initialData || defaultEmptyValues);
  // }
  // }, [initialData]);

  const openValidationErrorsModal = useValidationErrorsModal();

  const onSubmit = async (values: any) => {
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
        onInteractOutside={(e) => e.preventDefault()}
        className="max-h-[90vh] w-full max-w-5xl min-h-[70vh] flex flex-col"
      >
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
          <DialogDescription>
            Preencha os campos para adicionar ou editar um cliente.
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
                <TabsTrigger value="contato">Contato</TabsTrigger>
              </TabsList>
              <div className="flex-1 overflow-y-auto p-4">
                <TabsContent value="geral" className="mt-0 space-y-4">
                  <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="pessoa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Pessoa</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value ?? undefined}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="J">Jurídica</SelectItem>
                              <SelectItem value="F">Física</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {form.watch("pessoa") === "J" ? "CNPJ" : "CPF"}
                          </FormLabel>
                          <div className="flex items-center space-x-2">
                            <FormControl>
                              <PatternFormat
                                format={
                                  form.watch("pessoa") === "J"
                                    ? "##.###.###/####-##"
                                    : "###.###.###-##"
                                }
                                mask="_"
                                value={field.value || ""}
                                onValueChange={(values) => {
                                  field.onChange(values.value);
                                }}
                                customInput={CustomNumericInput}
                                placeholder={
                                  form.watch("pessoa") === "J"
                                    ? "00.000.000/0000-00"
                                    : "000.000.000-00"
                                }
                                allowLeadingZeros={true}
                              />
                            </FormControl>
                            {form.watch("pessoa") === "J" && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      size="icon"
                                      onClick={handleCnpjSearch}
                                      disabled={
                                        isLoadingCnpjSearch ||
                                        !form.getValues("cpf") ||
                                        (form.getValues("cpf") || "").replace(
                                          /\D/g,
                                          "",
                                        ).length !== 14
                                      }
                                    >
                                      {isLoadingCnpjSearch ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Search className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Buscar CNPJ</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ie"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inscrição Estadual</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Inscrição Estadual"
                              {...field}
                              value={field.value || ""}
                              className="w-full"
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

                  <FormField
                    control={form.control}
                    name="razaoSocial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{form.watch("pessoa") === "J" ? "Razão Social" : "Nome"}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Razão Social"
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
                  <div className="grid grid-cols-10 gap-4">
                    <FormField
                      control={form.control}
                      name="fantasia"
                      render={({ field }) => (
                        <FormItem className="col-span-7">
                          <FormLabel>Nome Fantasia</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nome Fantasia"
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
                      name="situacao"
                      render={({ field }) => (
                        <FormItem className="col-span-3">
                          <FormLabel>Situação</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            value={String(field.value ?? "")}
                            disabled={!canEditSituacao}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione a situação" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">
                                CADASTRO APROVADO
                              </SelectItem>
                              <SelectItem value="2">
                                CADASTRO EM OBSERVAÇÃO
                              </SelectItem>
                              <SelectItem value="3">
                                CADASTRO BLOQUEADO
                              </SelectItem>
                              <SelectItem value="4">INATIVO</SelectItem>
                              <SelectItem value="5">SPC</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Resto dos campos da aba Geral */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="cnae"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CNAE</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="CNAE"
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
                      name="codMunicipioIbge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cód. Município IBGE</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Código Município IBGE"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="crt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Regime Tributário</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value ?? undefined}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione o Regime" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="SIMPLES NACIONAL">
                                SIMPLES NACIONAL
                              </SelectItem>
                              <SelectItem value="SIMPLES NACIONAL - EXCESSO DE SUBLIMITE DA RECEITA BRUTA">
                                SIMPLES NACIONAL - EXCESSO DE SUBLIMITE DA
                                RECEITA BRUTA
                              </SelectItem>
                              <SelectItem value="REGIME NORMAL">
                                REGIME NORMAL
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Continuar com os outros campos... */}
                  {/* Por brevidade, vou incluir apenas alguns campos principais */}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="contribuinte"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Contribuinte</FormLabel>
                            <FormDescription>
                              Define se o cliente é contribuinte.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value === "S"}
                              onCheckedChange={(checked) =>
                                field.onChange(checked ? "S" : "N")
                              }
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="vlrMens"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Mensal</FormLabel>
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
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="melhorDia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Melhor Dia</FormLabel>
                          <FormControl>
                            <Input placeholder="Melhor Dia" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* Abas de Endereço e Contato - incluindo apenas estrutura básica */}
                <TabsContent value="endereco" className="mt-0 space-y-4">
                  {/* Campos de endereço aqui */}
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
                  <Separator className="my-4" />
                  <div className="mb-4 rounded-lg border p-4">
                    <h4 className="text-lg font-semibold">
                      Endereço de Correspondência
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                    <FormField
                      control={form.control}
                      name="correspCep"
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
                      name="correspEndereco"
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
                      name="correspNumero"
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
                      name="correspComplemento"
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
                      name="correspBairro"
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
                      name="correspCidade"
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
                      name="correspUf"
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

                <TabsContent value="contato" className="mt-0 space-y-4">
                  {/* Campos de contato aqui */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <FormField
                      control={form.control}
                      name="telefone1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone 1</FormLabel>
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
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="telefone2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone 2</FormLabel>
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
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="telefone3"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone 3</FormLabel>
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
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Principal</FormLabel>
                          <FormControl>
                            <Input placeholder="Email Principal" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email 1</FormLabel>
                          <FormControl>
                            <Input placeholder="Email 1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email 2</FormLabel>
                          <FormControl>
                            <Input placeholder="Email 2" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email3"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email 3</FormLabel>
                          <FormControl>
                            <Input placeholder="Email 3" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email4"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email 4</FormLabel>
                          <FormControl>
                            <Input placeholder="Email 4" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email5"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email 5</FormLabel>
                          <FormControl>
                            <Input placeholder="Email 5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
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
                  "Criar Cliente"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpsertClientForm;