'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

import { AnamneseItemForm, anamneseItemSchema } from '@/actions/upsert-anamnese/schema';
import { FormInput } from '@/components/form-fields/form-input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { SearchableSelect } from '@/components/ui/searchable-select';

interface AnamneseItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AnamneseItemForm) => void;
  defaultValues?: AnamneseItemForm;
  exameItems: { id: number; name: string }[];
  medicoItems: { id: number; name: string }[];
  isLoadingExames: boolean;
  isLoadingMedicos: boolean;
}

export function AnamneseItemModal({
  isOpen,
  onClose,
  onSave,
  defaultValues,
  exameItems,
  medicoItems,
  isLoadingExames,
  isLoadingMedicos,
}: AnamneseItemModalProps) {
  const t = useTranslations('AnamneseForm');
  const isEditing = !!defaultValues;

  const itemForm = useForm<AnamneseItemForm>({
    resolver: zodResolver(anamneseItemSchema),
    defaultValues: defaultValues || {},
  });

  const handleSave = (data: AnamneseItemForm) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onEscapeKeyDown={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()} className="[&>button]:hidden">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('edit_item_title') : t('add_item_title')}</DialogTitle>
        </DialogHeader>
        <Form {...itemForm}>
          <form onSubmit={itemForm.handleSubmit(handleSave)} className="space-y-4">
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
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormInput control={itemForm.control} name="valor" label="Valor" type="number" placeholder="Informe o valor" />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {t('cancel_button')}
              </Button>
              <Button type="submit">
                {isEditing ? t('save_changes_button') : t('add_item_button')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
