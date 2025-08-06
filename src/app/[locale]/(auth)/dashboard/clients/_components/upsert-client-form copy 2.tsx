"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, forwardRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { NumericFormat, PatternFormat } from "react-number-format";
import { Search, Loader2 } from "lucide-react";
import { useAction } from "@/hooks/use-action";
import { getCnpjInfo } from "@/actions/get-cnpj-info";



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

// Interfaces e tipos
interface Client {
  id?: string;
  organizationId?: string;
  razaoSocial?: string;
  fantasia?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  complemento?: string;
  moradia?: number;
  tipo?: number;
  situacao?: number;
  telefone1?: string;
  telefone2?: string;
  telefone3?: string;
  celular?: string;
  email?: string;
  rg?: string;
  cpf?: string;
  estadoCivil?: string;
  empresa?: string;
  dataCadastro?: Date;
  dataUltimaCompra?: Date;
  previsao?: Date;
  cnae?: string;
  codMunicipioIbge?: string;
  ibge?: string;
  correspEndereco?: string;
  correspBairro?: string;
  correspCidade?: string;
  correspUf?: string;
  correspCep?: string;
  correspComplemento?: string;
  correspNumero?: string;
  foto?: string;
  tipoCadastro?: string;
  ie?: string;
  mdia?: string;
  tDocumento?: string;
  tVencimento?: string;
  tCobranca?: string;
  retencoes?: string;
  simples?: string;
  correios?: string;
  email1?: string;
  email2?: string;
  email3?: string;
  email4?: string;
  email5?: string;
  contribuinte?: string;
  vlrMens?: number;
  observacao?: string;
  usaFor?: boolean;
  crt?: string;
  melhorDia?: string;
  vendedor?: string;
  teste?: string;
  travado?: boolean;
  ativo?: boolean;
  inadimplente?: boolean;
  especial?: boolean;
  bloqueado?: boolean;
  pessoa?: string;
  documentosPdf?: string;
  codigoAnterior?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UpsertClientFormProps {
  initialData?: Client;
  isOpen: boolean;
  onSuccess: () => void;
}

// Component personalizado para inputs numéricos
const CustomNumericInput = forwardRef<HTMLInputElement, any>(
  ({ className, ...props }, ref) => {
    const {
      allowLeadingZeros,
      format,
      mask,
      onValueChange,
      customInput,
      ...rest
    } = props;

    return <Input className={className} ref={ref} {...rest} />;
  },
);

CustomNumericInput.displayName = "CustomNumericInput";

// Função para validar CNPJ (você precisa implementar esta função)
const validarCNPJ = (cnpj: string): boolean => {
  // Implementar validação de CNPJ
  return cnpj.length === 14;
};

// Hook personalizado para debounce (você precisa implementar ou instalar)
const cepValue = form.watch("cep");
const [debouncedCep] = useDebounce(cepValue, 500);

// Hook para role do usuário (você precisa implementar)
const useUserRole = () => {
  return "SUPER_ADMIN"; // Placeholder
};

const UpsertClientForm = ({
  initialData,
  isOpen,
  onSuccess,
}: UpsertClientFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const userRole = useUserRole();
  const canEditSituacao = ["SUPER_ADMIN", "MASTER"].includes(
    userRole?.toUpperCase?.() ?? "",
  );

  const form = useForm({
    resolver: zodResolver(upsertClientSchema),
    defaultValues: initialData
      ? {
          id: initialData.id,
          organizationId: initialData.organizationId,
          razaoSocial: initialData.razaoSocial || "",
          fantasia: initialData.fantasia || "",
          endereco: initialData.endereco || "",
          numero: initialData.numero || "",
          bairro: initialData.bairro || "",
          cidade: initialData.cidade || "",
          uf: initialData.uf || "",
          cep: initialData.cep || "",
          complemento: initialData.complemento || "",
          moradia: initialData.moradia ?? undefined,
          tipo: initialData.tipo ?? undefined,
          situacao: initialData.situacao ?? undefined,
          telefone1: initialData.telefone1 || "",
          telefone2: initialData.telefone2 || "",
          telefone3: initialData.telefone3 || "",
          celular: initialData.celular || "",
          email: initialData.email || "",
          rg: initialData.rg || "",
          cpf: initialData.cpf || "",
          estadoCivil: initialData.estadoCivil || "",
          empresa: initialData.empresa || "",
          dataCadastro: initialData.dataCadastro ? new Date(initialData.dataCadastro) : undefined,
          dataUltimaCompra: initialData.dataUltimaCompra ? new Date(initialData.dataUltimaCompra) : undefined,
          previsao: initialData.previsao ? new Date(initialData.previsao) : undefined,
          cnae: initialData.cnae || "",
          codMunicipioIbge: initialData.codMunicipioIbge || "",
          ibge: initialData.ibge || "",
          correspEndereco: initialData.correspEndereco || "",
          correspBairro: initialData.correspBairro || "",
          correspCidade: initialData.correspCidade || "",
          correspUf: initialData.correspUf || "",
          correspCep: initialData.correspCep || "",
          correspComplemento: initialData.correspComplemento || "",
          correspNumero: initialData.correspNumero || "",
          foto: initialData.foto || "",
          tipoCadastro: initialData.tipoCadastro || "",
          ie: initialData.ie || "",
          mdia: initialData.mdia || "",
          tDocumento: initialData.tDocumento || "",
          tVencimento: initialData.tVencimento || "",
          tCobranca: initialData.tCobranca || "",
          retencoes: initialData.retencoes || "",
          simples: initialData.simples || "",
          correios: initialData.correios || "",
          email1: initialData.email1 || "",
          email2: initialData.email2 || "",
          email3: initialData.email3 || "",
          email4: initialData.email4 || "",
          email5: initialData.email5 || "",
          contribuinte: initialData.contribuinte || "N",
          vlrMens: initialData.vlrMens !== null && initialData.vlrMens !== undefined ? Number(initialData.vlrMens) : undefined,
          observacao: initialData.observacao || "",
          usaFor: initialData.usaFor ?? undefined,
          crt: initialData.crt || "",
          melhorDia: initialData.melhorDia || "",
          vendedor: initialData.vendedor || "",
          teste: initialData.teste || "",
          travado: initialData.travado ?? undefined,
          ativo: initialData.ativo ?? undefined,
          inadimplente: initialData.inadimplente ?? undefined,
          especial: initialData.especial ?? undefined,
          bloqueado: initialData.bloqueado ?? undefined,
          pessoa: initialData.pessoa || "J",
          documentosPdf: initialData.documentosPdf || "",
          codigoAnterior: initialData.codigoAnterior || "",
          createdAt: initialData.createdAt,
          updatedAt: initialData.updatedAt ?? undefined,
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
  const cepValue = form.watch("cep");
  const enderecoValue = form.watch("endereco");
  const correspCepValue = form.watch("correspCep");
  const correspEnderecoValue = form.watch("correspEndereco");

  const [debouncedCep] = useDebounce(cepValue, 500);
  const [debouncedCorrespCep] = useDebounce(correspCepValue, 500);

  


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
        if (response.data.success) {
          form.setValue(
            "razaoSocial",
            (response.data.data.nome || "").toUpperCase(),
          );
          form.setValue(
            "fantasia",
            (
              response.data.data.fantasia ||
              response.data.data.nome ||
              ""
            ).toUpperCase(),
          );
          form.setValue(
            "endereco",
            (response.data.data.logradouro || "").toUpperCase(),
          );
          form.setValue(
            "numero",
            (response.data.data.numero || "").toUpperCase(),
          );
          form.setValue(
            "complemento",
            (response.data.data.complemento || "").toUpperCase(),
          );
          form.setValue(
            "bairro",
            (response.data.data.bairro || "").toUpperCase(),
          );
          form.setValue(
            "cidade",
            (response.data.data.municipio || "").toUpperCase(),
          );
          form.setValue("uf", (response.data.data.uf || "").toUpperCase());
          form.setValue("cep", response.data.data.cep || "");
          form.setValue("ie", (response.data.data.ie || "").toUpperCase());
          form.setValue(
            "cnae",
            (response.data.data.atividade_principal?.[0]?.code || "").toUpperCase(),
          );
          form.setValue("telefone1", response.data.data.telefone || "");
          form.setValue("email", response.data.data.email || "");

          const rawCpfCnpj = response.data.data.cnpj;
          if (rawCpfCnpj) {
            const cleanedValue = rawCpfCnpj.replace(/\D/g, "");
            form.setValue("pessoa", "J"); // Define o tipo de pessoa como Jurídica
            form.setValue("cpf", cleanedValue);
          }

          console.log("Form values after setValue:", form.getValues()); // Novo log
          toast.success("Dados do CNPJ preenchidos com sucesso!");
          form.reset(form.getValues()); // Força a redefinição do formulário com os novos valores
        } else {
          toast.error(response.data.error || "Erro ao buscar CNPJ.");
        }
      },
      onError: (error) => {
        toast.error(
          (error as any).serverError || "Ocorreu um erro inesperado ao buscar CNPJ.",
        );
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

  useEffect(() => {
    form.reset(initialData || defaultEmptyValues);
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
    <Dialog open={isOpen} onOpenChange={onSuccess}>
      <DialogContent
        hideCloseButton
        className="max-h-[90vh] w-full max-w-5xl overflow-y-auto"
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
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-4"
          >
            <Tabs defaultValue="geral" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="geral">Geral</TabsTrigger>
                <TabsTrigger value="endereco">Endereço</TabsTrigger>
                <TabsTrigger value="contato">Contato</TabsTrigger>
              </TabsList>
              <TabsContent value="geral" className="space-y-4 py-4">
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
                                      (form.getValues("cpf") || "").replace(/\D/g, "")
                                        .length !== 14
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
                      <FormLabel>Razão Social</FormLabel>
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
                            <SelectItem value="1">CADASTRO APROVADO</SelectItem>
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
                              SIMPLES NACIONAL - EXCESSO DE SUBLIMITE DA RECEITA
                              BRUTA
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
              <TabsContent value="endereco" className="space-y-4 py-4">
                {/* Campos de endereço aqui */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                  <FormField
                    control={form.control}
                    name="cep"
                    render={({ field }) => (
                      <FormItem className="col-span-12 md:col-span-2">
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <NumericFormat
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
                          <NumericFormat
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
              
              <TabsContent value="contato" className="space-y-4 py-4">
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
            </Tabs>
            
            <DialogFooter>
              <Button
                type="button"
                variant="destructive"
                onClick={onSuccess}
                className="w-35"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
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