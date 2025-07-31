'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useAction } from "@/hooks/use-action";
import { useValidationErrorsModal } from "@/components/ui/validation-errors-modal";

import { upsertAnamneseSchema, anamneseItemSchema, AnamneseItemForm } from '@/actions/upsert-anamnese/schema';
import { upsertAnamnese} from '@/actions/upsert-anamnese';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/form-fields/form-input';
import { FormDatePickerHybrid } from '@/components/form-fields/form-date-picker-hybrid';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { getClientsForSelect } from '@/actions/get-clients-for-select';
import { getColaboradoresForSelect } from '@/actions/get-colaboradores-for-select';
import { getExamesForSelect } from '@/actions/get-exames-for-select';
import { getMedicosForSelect } from '@/actions/get-medicos-for-select';
import { useAuth } from '@clerk/nextjs';
import { FormSelect } from '@/components/form-fields/form-select';
import { exametipoEnum, formapagtoEnum } from '@/models/Schema';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { formatCurrency } from '@/helpers/format';

import {
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
interface UpsertAnamneseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (anamneseId?: string | number) => void;
}

export function UpsertAnamneseForm({
  isOpen,
  onClose,
  onSuccess,
}: UpsertAnamneseFormProps) {
  const t = useTranslations('AnamneseForm');
  const tFormFields = useTranslations('FormFields');
  const router = useRouter()
  const { orgId, userId } = useAuth();
  const queryClient = useQueryClient()
  const openValidationErrorsModal = useValidationErrorsModal();
  
  // ✅ Ref para o DatePicker híbrido (agora é um input)
  const datePickerRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const createColabRef = useRef<HTMLInputElement>(null)
  const createClientRef = useRef<HTMLInputElement>(null)
  
  /* diálogo de cadastro do colaborador */
  const [openCreate, setOpenCreate] = useState(false)
  const [openCreateClient, setOpenCreateClient] = useState(false)
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);


  const form = useForm<UpsertAnamneseForm>({
    resolver: zodResolver(upsertAnamneseSchema),
    defaultValues: {
      items: [],
    },
  });

  const itemForm = useForm<AnamneseItemForm>({
    resolver: zodResolver(anamneseItemSchema),
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // ✅ Configurar atendenteId
  useEffect(() => {
    if (userId) {
      form.setValue("atendenteId", userId);
    }
  }, [userId, form]);

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
    return exames?.data?.find(exame => exame.id === id)?.name;
  };

  const getMedicoNameById = (id: number) => {
    return medicos?.data?.find(medico => medico.id === id)?.name;
  };

  // Handlers para itens
  const handleAddItem = () => {
    setEditingItemIndex(null);
    itemForm.reset({
      exameId: undefined,
      medicoId: undefined,
      valor: undefined,
    });
    setIsItemModalOpen(true);
  };

  const handleEditItem = (index: number) => {
    setEditingItemIndex(index);
    itemForm.reset(fields[index]);
    setIsItemModalOpen(true);
  };

  const handleRemoveItem = (index: number) => {
    remove(index);
  };

  const onSaveItem = (itemData: AnamneseItemForm) => {
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
      onSuccess(data.id);
      onClose();
    },
    onError: (error) => {
      
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
                    <FormDatePickerHybrid
                      ref={datePickerRef}
                      control={form.control}
                      name="data"
                      label="Data"
                      className="w-full"
                      placeholder={tFormFields('placeholder_date')}
                      required
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
                      options={exametipoEnum.enumValues.map((value) => ({
                        label: value,
                        value,
                      }))}
                    />

                    <FormSelect
                      control={form.control}
                      name="formaPagto"
                      label="Forma de Pagto"
                      placeholder="Selecione a forma de pagamento"
                      options={formapagtoEnum.enumValues.map((value) => ({
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
                <CardContent className="space-y-4">
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
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditItem(row.index)}
                            >
                              {t('edit_item_button')}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveItem(row.index)}
                            >
                              {t('remove_item_button')}
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                    data={fields}
                    emptyMessage={t('no_items_found')}
                  />

                  <div className="flex justify-end pt-4 pr-4">
                    <span className="text-lg font-semibold">
                      Valor Total dos Exames: {formatCurrency(fields.reduce((acc, item) => acc + (item.valor || 0), 0))}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  {t('cancel_button')}
                </Button>
                <Button type="submit">{t('submit_button')}</Button>
              </div>
            </form>
          </Form>

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

                  <FormInput
                    control={itemForm.control}
                    name="valor"
                    label="Valor"
                    type="number"
                    placeholder="Informe o valor"
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
        </DialogContent>
      </Dialog>
      
      {openCreate && (
        <ValidationErrorsModalProvider>
          
        </ValidationErrorsModalProvider>
      )}

      {openCreateClient && (
        <ValidationErrorsModalProvider>
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
        </ValidationErrorsModalProvider>
      )}
    </>
  );
}