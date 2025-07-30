'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { upsertAnamneseSchema, UpsertAnamneseForm, anamneseItemSchema, AnamneseItemForm } from '@/actions/upsert-anamnese/schema';
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
import { FormDatePicker } from '@/components/form-fields/form-date-picker';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { getClientsForSelect } from '@/actions/get-clients-for-select';
import { getColaboradoresForSelect } from '@/actions/get-colaboradores-for-select';
import { getExamesForSelect } from '@/actions/get-exames-for-select';
import { getMedicosForSelect } from '@/actions/get-medicos-for-select';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { FormSelect } from '@/components/form-fields/form-select';
import { exametipoEnum, formapagtoEnum } from '@/models/Schema';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { formatCurrency } from '@/helpers/format';

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
  const { orgId } = useAuth();
  const router = useRouter();

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  const form = useForm<UpsertAnamneseForm>({
    resolver: zodResolver(upsertAnamneseSchema),
    defaultValues: {
      items: [],
      // outros valores padrão
    },
  });

  const { userId } = useAuth();

  useEffect(() => {
    if (userId) {
      form.setValue("atendenteId", userId);
    }
  }, [userId, form]);

  const itemForm = useForm<AnamneseItemForm>({
    resolver: zodResolver(anamneseItemSchema),
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ["clientsForSelect", orgId],
    queryFn: () => getClientsForSelect({}),
    enabled: !!orgId,
  });

  const { data: colaboradores, isLoading: isLoadingColaboradores } = useQuery({
    queryKey: ["colaboradoresForSelect", orgId],
    queryFn: () => getColaboradoresForSelect({}),
    enabled: !!orgId,
  });

  const { data: exames, isLoading: isLoadingExames } = useQuery({
    queryKey: ["examesForSelect", orgId],
    queryFn: () => getExamesForSelect({}),
    enabled: !!orgId,
  });

  const { data: medicos, isLoading: isLoadingMedicos } = useQuery({
    queryKey: ["medicosForSelect", orgId],
    queryFn: () => getMedicosForSelect({}),
    enabled: !!orgId,
  });

  const getExameNameById = (id: number) => {
    return exames?.data?.find(exame => exame.id === id)?.name;
  };

  const getMedicoNameById = (id: number) => {
    return medicos?.data?.find(medico => medico.id === id)?.name;
  };

  const handleAddItem = () => {
    setEditingItemIndex(null);
    itemForm.reset();
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

  const onSubmit = (data: UpsertAnamneseForm) => {
    console.log(data);
    // Chamar a server action aqui
    // upsertAnamnese(data);
  };

  const clientItems = clients?.data && Array.isArray(clients.data) ? clients.data.map(client => ({ id: client.id, name: client.name || '' })) : [];
  const colaboradorItems = colaboradores?.data && Array.isArray(colaboradores.data) ? colaboradores.data.map(colaborador => ({ id: colaborador.id, name: colaborador.name || '' })) : [];
  const exameItems = exames?.data && Array.isArray(exames.data) ? exames.data.map(exame => ({ id: exame.id, name: exame.descricao || '' })) : [];
  const medicoItems = medicos?.data && Array.isArray(medicos.data) ? medicos.data.map(medico => ({ id: medico.id, name: medico.nome || '' })) : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onEscapeKeyDown={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()} className="[&>button]:hidden w-full max-w-full max-w-screen-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingItemIndex !== null ? t('edit_item_title') : t('add_item_title')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>{t('master_section_title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormDatePicker
                    control={form.control}
                    name="data"
                    label="Data do Atendimento"
                  />
                  <FormField
                    control={form.control}
                    name="atendenteId"
                    render={({ field }) => (
                      <FormItem className="hidden">
                        <FormLabel>Atendente ID</FormLabel>
                        <FormControl>
                          <FormInput {...field} type="hidden" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="colaboradorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Colaborador</FormLabel>
                        <SearchableSelect
                          items={colaboradorItems}
                          selectedValue={field.value}
                          onValueChange={field.onChange}
                          placeholder="Selecione um colaborador"
                          searchPlaceholder="Pesquisar colaborador..."
                          noResultsText="Nenhum colaborador encontrado."
                          isLoading={isLoadingColaboradores}
                          className=""
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormSelect
                    control={form.control}
                    name="formaPagto"
                    label="Forma de Pagto"
                    placeholder="Selecione a forma de pagamento"
                    options={formapagtoEnum.enumValues.map(value => ({ label: value, value }))}
                  />
                  <FormSelect
                    control={form.control}
                    name="tipo"
                    label="Tipo de Exame"
                    placeholder="Selecione o tipo de exame"
                    options={exametipoEnum.enumValues.map(value => ({ label: value, value }))}
                  />
                  <FormField
                    control={form.control}
                    name="clienteId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <SearchableSelect
                          items={clientItems}
                          selectedValue={field.value}
                          onValueChange={field.onChange}
                          placeholder="Selecione um cliente"
                          searchPlaceholder="Pesquisar cliente..."
                          noResultsText="Nenhum cliente encontrado."
                          isLoading={isLoadingClients}
                          className=""
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
              <CardHeader>
                <CardTitle>{t('detail_section_title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tabela de Itens (anamneseItemsTable) */}
                <DataTable
                  columns={[
                    {
                      accessorKey: "exameId",
                      header: t('item_exam_header'),
                      cell: ({ row }) => {
                        const exame = getExameNameById(row.original.exameId);
                        return exame || "";
                      },
                    },
                    {
                      accessorKey: "medicoId",
                      header: t('item_doctor_header'),
                      cell: ({ row }) => {
                        const medico = getMedicoNameById(row.original.medicoId);
                        return medico || "";
                      },
                    },
                    {
                      accessorKey: "valor",
                      header: t('item_value_header'),
                      cell: ({ row }) => formatCurrency(row.original.valor || 0),
                    },
                    {
                      id: "actions",
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
                <Button type="button" onClick={handleAddItem}>
                  {t('add_item_button')}
                </Button>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                {t('cancel_button')}
              </Button>
              <Button type="submit">{t('submit_button')}</Button>
            </div>
          </form>

          {/* Modal para Adicionar/Editar Item */}
          <Dialog open={isItemModalOpen} onOpenChange={setIsItemModalOpen}>
            <DialogContent onEscapeKeyDown={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()} className="[&>button]:hidden">
              <DialogHeader>
                <DialogTitle>{editingItemIndex !== null ? t('edit_item_title') : t('add_item_title')}</DialogTitle>
              </DialogHeader>
              <Form {...itemForm}>
                <form onSubmit={itemForm.handleSubmit(onSaveItem)} className="space-y-4">
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
                          className=""
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
                          className=""
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
                    <Button type="button" variant="outline" onClick={() => setIsItemModalOpen(false)}>
                      {t('cancel_button')}
                    </Button>
                    <Button type="submit">
                      {editingItemIndex !== null ? t('save_changes_button') : t('add_item_button')}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
