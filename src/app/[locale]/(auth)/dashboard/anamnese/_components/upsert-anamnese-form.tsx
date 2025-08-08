'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { NumericFormat } from "react-number-format";
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useAction } from '@/hooks/use-action';
import { useValidationErrorsModal, ValidationErrorsModalProvider } from "@/components/ui/validation-errors-modal";
import { toast } from "sonner";

import { upsertAnamneseSchema, anamneseItemSchema, AnamneseItemForm } from '@/actions/upsert-anamnese/schema';
import { upsertAnamnese} from '@/actions/upsert-anamnese';
import { deleteAnamneseItem } from '@/actions/delete-anamnese-item';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/form-fields/form-input';
import { FormDatePickerHybrid } from '@/components/form-fields/form-date-picker-hybrid';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { FormNumberInput } from '@/components/form-fields/form-number-input';
import { getClientsForSelect } from '@/actions/get-clients-for-select';
import { getColaboradoresForSelect } from '@/actions/get-colaboradores-for-select';
import { getExamesForSelect } from '@/actions/get-exames-for-select';
import { getMedicosForSelect } from '@/actions/get-medicos-for-select';
import { useAuth } from '@clerk/nextjs';
import { FormSelect } from '@/components/form-fields/form-select';
import { exametipo_enum, formapagto_enum } from '@/models/Schema';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { formatCurrency } from '@/helpers/format';
import { getExamValue } from '@/actions/get-exam-value';
import { UpsertColaboradorForm } from '@/app/[locale]/(auth)/dashboard/colaboradores/_components/upsert-colaborador-form';
import UpsertClientForm from '@/app/[locale]/(auth)/dashboard/clients/_components/upsert-client-form';
import { GetExamValueInput } from '@/actions/get-exam-value/schema';
import { upsertClientExam } from '@/actions/upsert-client-exam';
import { checkAndSuggestClientExamValueUpdate, type CheckAndSuggestClientExamValueUpdateResult } from '@/actions/check-and-suggest-client-exam-value-update';

import {
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { z } from 'zod';

// Adicionar o tipo que estava faltando
type UpsertAnamneseForm = z.infer<typeof upsertAnamneseSchema>;

interface UpsertAnamneseFormProps {
  initialData?: z.infer<typeof upsertAnamneseSchema>;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (anamneseId?: string | number) => void;
}

export function UpsertAnamneseForm({
  initialData,
  isOpen,
  onClose,
  onSuccess,
}: UpsertAnamneseFormProps) {
  const t = useTranslations('AnamneseForm');
  const tFormFields = useTranslations('FormFields');
  const router = useRouter();
  const { orgId, userId } = useAuth();
  const queryClient = useQueryClient();
  const openValidationErrorsModal = useValidationErrorsModal();

  // ✅ Ref para o DatePicker híbrido (agora é um input)
  const datePickerRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const createColabRef = useRef<HTMLInputElement>(null);
  const createClientRef = useRef<HTMLInputElement>(null);

  /* diálogo de cadastro do colaborador */
  const [openCreate, setOpenCreate] = useState(false);
  const [openCreateClient, setOpenCreateClient] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  // Adicionar a variável que estava faltando
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [showExamValueUpdateConfirmation, setShowExamValueUpdateConfirmation] = useState(false);
  const [examUpdatesToConfirm, setExamUpdatesToConfirm] = useState<any[]>([]);
  const [selectedExamsToUpdate, setSelectedExamsToUpdate] = useState<Set<number>>(new Set());
  const [pendingAnamneseItem, setPendingAnamneseItem] = useState<AnamneseItemForm | null>(null);

  const form = useForm<z.infer<typeof upsertAnamneseSchema>>({
    resolver: zodResolver(upsertAnamneseSchema),
    defaultValues: initialData || {
      data: new Date(),
      items: [],
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(
        initialData || {
          data: new Date(),
          items: [],
        },
      );
    }
  }, [isOpen, initialData, form]);

  const itemForm = useForm<AnamneseItemForm>({
    resolver: zodResolver(anamneseItemSchema),
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // Observar mudanças em exameId e clienteId para buscar o valor do exame
  const watchedExameId = itemForm.watch('exameId');
  const watchedClienteId = form.watch('clienteId');

  const { data: examValueData } = useQuery({
    queryKey: ['examValue', watchedExameId, watchedClienteId, orgId],
    queryFn: () =>
      getExamValue({ exameId: watchedExameId!, clienteId: watchedClienteId! }),
    enabled: !!watchedExameId && !!orgId, // Habilitar a query apenas se exameId e orgId existirem
    refetchOnWindowFocus: false,
  });

  // ✅ Configurar atendenteId
  useEffect(() => {
    if (userId && !initialData) {
      form.setValue('atendenteId', userId);
    }
  }, [userId, initialData, form]);

  // Atualizar o campo valor do itemForm quando o valor do exame for buscado
  useEffect(() => {
    if (examValueData?.data?.data?.valor !== undefined && examValueData.data.data.valor !== null) {
      const newValue = Number(examValueData.data.data.valor);
      itemForm.setValue('valor', newValue);
    }
  }, [examValueData, itemForm]);

  // Queries para dados
  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ["clientsForSelect", orgId],
    queryFn: () => getClientsForSelect({}),
    enabled: !!orgId,
    refetchOnWindowFocus: false,
  });

  const { data: colaboradores, isLoading: isLoadingColaboradores } = useQuery({
    queryKey: ["colaboradoresForSelect", orgId],
    queryFn: () => getColaboradoresForSelect({}),
    enabled: !!orgId,
    refetchOnWindowFocus: false,
  });
  
  const { data: exames, isLoading: isLoadingExames } = useQuery({
    queryKey: ["examesForSelect", orgId],
    queryFn: () => getExamesForSelect({}),
    enabled: !!orgId,
    refetchOnWindowFocus: false,
  });

  const { data: medicos, isLoading: isLoadingMedicos } = useQuery({
    queryKey: ["medicosForSelect", orgId],
    queryFn: () => getMedicosForSelect({}),
    enabled: !!orgId,
    refetchOnWindowFocus: false,
  });

  // Funções auxiliares
  const getExameNameById = (id: number) => {
    return exames?.data?.data?.find(exame => exame.id === id)?.name;
  };

  const getMedicoNameById = (id: number) => {
    return medicos?.data?.data?.find(medico => medico.id === id)?.name;
  };

  // Handlers para itens
  const handleAddItem = () => {
    setEditingItemIndex(null);
    itemForm.reset({
      exameId: undefined,
      medicoId: undefined,
      // valor: undefined, // Removido para permitir que o useEffect defina o valor
    });
    setIsItemModalOpen(true);
  };

  const handleEditItem = (index: number) => {
    setEditingItemIndex(index);
    itemForm.reset(fields[index]);
    setIsItemModalOpen(true);
  };

  const { execute: executeDeleteItem, status: deleteItemStatus } = useAction(deleteAnamneseItem, {
    onSuccess: () => {
      toast.success(t('delete_item_success'));
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const handleRemoveItem = (index: number) => {
    const item = fields[index];
    if (initialData?.id && item.id) { // Verifica se a anamnese e o item já existem no banco
      executeDeleteItem({ anamneseId: initialData.id, itemId: item.id });
    }
    remove(index);
  };

  const onSaveItem = async (itemData: AnamneseItemForm) => {
    const currentClientId = form.getValues('clienteId'); // Get clientId from main form

    if (currentClientId && itemData.exameId && itemData.valor !== undefined && itemData.valor !== null) {
      const result = await checkAndSuggestClientExamValueUpdate({
        clientId: currentClientId,
        exameId: itemData.exameId,
        newAnamneseItemValue: itemData.valor,
      });

      if (result.data) {
        setExamUpdatesToConfirm([result]); // Only one suggestion at a time
        setSelectedExamsToUpdate(new Set([result.data.exameId])); // Pre-select the current exam
        setPendingAnamneseItem(itemData); // Store itemData for later
        setShowExamValueUpdateConfirmation(true);
        // Do not close item modal yet, wait for user confirmation
        return;
      }
    }

    // If no suggestion or no client/exam/value, proceed with saving item
    if (editingItemIndex !== null) {
      update(editingItemIndex, itemData);
    } else {
      append(itemData);
    }
    setIsItemModalOpen(false);
  };

  const { execute, status } = useAction(upsertAnamnese, {
    onSuccess: (data) => {
      toast.success(initialData ? 'Anamnese atualizada' : 'Anamnese criada');
      onSuccess(data.data.anamnese?.id);
      onClose();
    },
    onError: (error) => {
      openValidationErrorsModal([error]);
    },
  });

  const onSubmit = (data: UpsertAnamneseForm) => {
    execute(data);
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

  // Transformar dados para os selects
  const clientItems = clients?.data && Array.isArray(clients.data.data) 
    ? clients.data.data.map(client => ({ id: client.id, name: client.name || '' })) 
    : [];
    
  const colaboradorItems = colaboradores?.data && Array.isArray(colaboradores.data.data) 
    ? colaboradores.data.data.map(colaborador => ({ 
        id: colaborador.id, 
        name: `${colaborador.name} - ${colaborador.cpf}` || '' 
      })) 
    : [];
    
  const exameItems = exames?.data && Array.isArray(exames.data.data) 
    ? exames.data.data.map(exame => ({ id: exame.id, name: exame.name || '' })) 
    : [];
    
  const medicoItems = medicos?.data && Array.isArray(medicos.data.data) 
    ? medicos.data.data.map(medico => ({ id: medico.id, name: medico.name || '' })) 
    : [];

  

  const { execute: executeUpsertClientExam } = useAction(upsertClientExam, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["examValue"] }); // Invalidate exam value cache
      queryClient.invalidateQueries({ queryKey: ["examesForSelect"] }); // Invalidate examesForSelect cache
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar valor do exame do cliente: ${error}`);
    },
  });

  const handleConfirmExamValueUpdate = async () => {
    for (const update of examUpdatesToConfirm) {
      if (selectedExamsToUpdate.has(update.exameId)) {
        await executeUpsertClientExam({
          clientId: update.data.clientId,
          exameId: update.data.exameId,
          valor: Number(update.data.newAnamneseItemValue),
          id: update.data.id, // Passar o ID para a action
        });
      }
    }
    toast.success(t('exam_values_updated_success'));
    setShowExamValueUpdateConfirmation(false);
    setExamUpdatesToConfirm([]);
    setSelectedExamsToUpdate(new Set()); // Clear selected exams

    // Save the pending item after confirmation
    if (pendingAnamneseItem) {
      if (editingItemIndex !== null) {
        update(editingItemIndex, pendingAnamneseItem);
      } else {
        append(pendingAnamneseItem);
      }
      setPendingAnamneseItem(null); // Clear pending item
    }
    setIsItemModalOpen(false); // Close item modal
  };

  const handleCancelExamValueUpdate = () => {
    setShowExamValueUpdateConfirmation(false);
    setExamUpdatesToConfirm([]);
    setSelectedExamsToUpdate(new Set()); // Clear selected exams
    setPendingAnamneseItem(null); // Discard pending item
    setIsItemModalOpen(false); // Close item modal
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          className="[&>button]:hidden w-full max-w-[1400px] overflow-y-auto focus:outline-none"
          initialFocus={datePickerRef}
        >
          <DialogHeader>
            <DialogTitle>{t('form_title')}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, onInvalid)}
              className="space-y-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle>{t('master_section_title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-4">
                  <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-5">
                    {/* ✅ DatePicker com ref e props adicionais para debug */}
                    <FormField
                      control={form.control}
                      name="data"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Data</FormLabel>
                          <FormControl>
                            <FormDatePickerHybrid
                              ref={datePickerRef}
                              value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : (typeof field.value === 'string' ? field.value : undefined)}
                              onChange={(isoString) => field.onChange(isoString ? new Date(isoString) : undefined)}
                              placeholder={tFormFields('placeholder_date')}
                              required
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="colaboradorId"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Colaborador</FormLabel>

                          <SearchableSelect
                            ref={field.ref}
                            items={colaboradorItems}
                            selectedValue={field.value}
                            onValueChange={field.onChange}
                            placeholder="Selecione um colaborador"
                            searchPlaceholder="Pesquisar colaborador..."
                            noResultsText="Nenhum colaborador encontrado."
                            isLoading={isLoadingColaboradores}
                            onCreate={() => setOpenCreate(true)}
                            createLabel="Cadastrar colaborador"
                          />

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormSelect
                      control={form.control}
                      name="tipo"
                      label="Tipo de Exame"
                      placeholder="Selecione o tipo de exame"
                      options={exametipo_enum.enumValues.map((value) => ({
                        label: value,
                        value,
                      }))}
                    />

                    <FormSelect
                      control={form.control}
                      name="formapagto"
                      label="Forma de Pagto"
                      placeholder="Selecione a forma de pagamento"
                      options={formapagto_enum.enumValues.map((value) => ({
                        label: value,
                        value,
                      }))}
                    />

                    {/* Campo hidden para atendenteId */}
                    <FormField
                      control={form.control}
                      name="atendenteId"
                      render={({ field }) => (
                        <FormItem className="hidden">
                          <FormControl>
                            <input {...field} type="hidden" />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="clienteId"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Cliente</FormLabel>
                          <SearchableSelect
                            items={clientItems}
                            selectedValue={field.value}
                            onValueChange={field.onChange}
                            placeholder="Selecione um cliente"
                            searchPlaceholder="Pesquisar cliente..."
                            noResultsText="Nenhum cliente encontrado."
                            isLoading={isLoadingClients}
                            onCreate={() => setOpenCreateClient(true)}
                            createLabel="Cadastrar cliente"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormInput
                      control={form.control}
                      name="cargo"
                      label="Cargo"
                      placeholder="Informe o cargo"
                    />

                    <FormInput
                      control={form.control}
                      name="setor"
                      label="Setor"
                      placeholder="Informe o setor"
                    />

                    <FormInput
                      control={form.control}
                      name="solicitante"
                      label="Solicitante"
                      placeholder="Informe o solicitante"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>{t('detail_section_title')}</CardTitle>
                  <Button
                    type="button"
                    onClick={handleAddItem}
                    data-testid="add-item-button"
                  >
                    {t('add_item_button')}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4 px-4 max-h-[350px] overflow-y-auto">
                  <DataTable
                    columns={[
                      {
                        accessorKey: 'exameId',
                        header: t('item_exam_header'),
                        cell: ({ row }) => {
                          const exame = getExameNameById(
                            row.original.exameId,
                          );
                          return exame || '';
                        },
                      },
                      {
                        accessorKey: 'medicoId',
                        header: t('item_doctor_header'),
                        cell: ({ row }) => {
                          const medico = getMedicoNameById(
                            row.original.medicoId,
                          );
                          return medico || '';
                        },
                      },
                      {
                        accessorKey: 'valor',
                        header: t('item_value_header'),
                        cell: ({ row }) =>
                          formatCurrency(row.original.valor || 0),
                      },
                      {
                        id: 'actions',
                        header: t('item_actions_header'),
                        cell: ({ row }) => (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">{t('open_menu')}</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEditItem(row.index)}>
                                {t('edit_item_button')}
                              </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setItemToDelete(row.index)} className="text-red-600">
                                {t('remove_item_button')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ),
                      },
                    ]}
                    data={fields}
                    emptyMessage={t('no_items_found')}
                  />
                </CardContent>
                <div className="flex justify-end pt-4 pr-4">
                  <span className="text-lg font-semibold">
                    Valor Total dos Exames: {formatCurrency(fields.reduce((acc, item) => acc + (item.valor || 0), 0))}
                  </span>
                </div>
              </Card>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  {t('cancel_button')}
                </Button>
                <Button type="submit">{t('submit_button')}</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal para Adicionar/Editar Item */}
      <Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
        <DialogContent
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          className="[&>button]:hidden max-w-3xl"
        >
          <DialogHeader>
            <DialogTitle>
              {editingItemIndex !== null
                ? t('edit_item_title')
                : t('add_item_title')}
            </DialogTitle>
          </DialogHeader>

          <Form {...itemForm}>
            <form
              onSubmit={itemForm.handleSubmit(onSaveItem)}
              className="space-y-4"
            >
              <FormField
                control={itemForm.control}
                name="exameId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exame</FormLabel>
                    <SearchableSelect
                      items={exameItems}
                      selectedValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Selecione um exame"
                      searchPlaceholder="Pesquisar exame..."
                      noResultsText="Nenhum exame encontrado."
                      isLoading={isLoadingExames}
                      searchKeys={['name', 'id']}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={itemForm.control}
                name="medicoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Médico</FormLabel>
                    <SearchableSelect
                      items={medicoItems}
                      selectedValue={field.value}
                      onValueChange={field.onChange}
                      placeholder="Selecione um médico"
                      searchPlaceholder="Pesquisar médico..."
                      noResultsText="Nenhum médico encontrado."
                      isLoading={isLoadingMedicos}
                      searchKeys={['name', 'id']}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={itemForm.control}
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsItemModalOpen(false)}
                >
                  {t('cancel_button')}
                </Button>
                <Button type="submit">
                  {editingItemIndex !== null
                    ? t('save_changes_button')
                    : t('add_item_button')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={itemToDelete !== null} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete_item_confirm_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('delete_item_confirm_description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => { handleRemoveItem(itemToDelete!); setItemToDelete(null); }}>
              {t('continue')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Confirmação de Atualização de Valor de Exame */}
      <AlertDialog open={showExamValueUpdateConfirmation} onOpenChange={setShowExamValueUpdateConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('exam_value_update_confirm_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('exam_value_update_confirm_description')}
            </AlertDialogDescription>
            <ul className="list-disc pl-5 mt-2">
              {examUpdatesToConfirm.map((update, index) => {
                if (!update.data) return null; // Adiciona uma verificação de segurança
                return (
                  <li key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={`exam-update-${index}`}
                      checked={selectedExamsToUpdate.has(update.data.exameId)}
                      onCheckedChange={(checked) => {
                        setSelectedExamsToUpdate((prev) => {
                          const newSet = new Set(prev);
                          if (checked) {
                            newSet.add(update.data.exameId);
                          } else {
                            newSet.delete(update.data.exameId);
                          }
                          return newSet;
                        });
                      }}
                    />
                    <label htmlFor={`exam-update-${index}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {t('exam_value_update_item', {
                        exameName: getExameNameById(update.data.exameId),
                        currentValue: formatCurrency(Number(update.data.currentClientExamValue)),
                        newValue: formatCurrency(Number(update.data.newAnamneseItemValue)),
                      })}
                    </label>
                  </li>
                );
              })}
            </ul>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelExamValueUpdate}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmExamValueUpdate} disabled={selectedExamsToUpdate.size === 0}>{t('confirm_update')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {openCreateClient && (
        <UpsertClientForm
            isOpen={openCreateClient}
            onClose={() => setOpenCreateClient(false)}
            onSuccess={async (client) => {
              await queryClient.invalidateQueries({
                queryKey: ['clientsForSelect', orgId],
              });
              if (client && client.id) {
                form.setValue('clienteId', client.id, {
                  shouldValidate: true,
                });
              }
              setOpenCreateClient(false);
            }}
          />
      )}

      {openCreate && (
        <UpsertColaboradorForm
          isOpen={openCreate}
          onClose={() => setOpenCreate(false)}
          onSuccess={async (colaborador) => {
            await queryClient.invalidateQueries({
              queryKey: ['colaboradoresForSelect', orgId],
            });
            if (colaborador && colaborador.id) {
              form.setValue('colaboradorId', colaborador.id, {
                shouldValidate: true,
              });
            }
            setOpenCreate(false);
          }}
        />
      )}
    </>
  );
}