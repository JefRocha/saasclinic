import { z } from 'zod';
import { formapagtoEnum, exametipoEnum } from '@/models/Schema';

// Schema para cada item (exame) na anamnese
export const anamneseItemSchema = z.object({
  id: z.number().optional(), // ID para itens existentes (edição)
  exameId: z.number({ required_error: 'Selecione um exame.' }),
  medicoId: z.number({ required_error: 'Selecione um médico.' }),
  valor: z.number().min(0, 'O valor não pode ser negativo.'),
  // Adicione outros campos do anamneseItemsTable que serão editáveis no formulário de item
  // faturar: z.string().optional(),
  // vencto: z.date().optional(),
  // apto: z.number().optional(),
});

// Schema principal para o formulário de anamnese (mestre-detalhe)
export const upsertAnamneseSchema = z.object({
  id: z.number().optional(), // ID para anamnese existente (edição)

  // --- Chaves Estrangeiras ---
  clienteId: z.number({ required_error: 'Selecione um cliente.' }),
  colaboradorId: z.number({ required_error: 'Selecione um colaborador.' }),
  atendenteId: z.string().optional(),

  // --- Dados do atendimento ---
  data: z.date({ required_error: 'A data do atendimento é obrigatória.' }),
  formaPagto: z.enum(formapagtoEnum.enumValues, { required_error: 'Selecione a forma de pagamento.' }),
  tipo: z.enum(exametipoEnum.enumValues, { required_error: 'Selecione o tipo de exame.' }),
  cargo: z.string({ required_error: 'O cargo é obrigatório.'}),
  setor: z.string().optional(),
  solicitante: z.string().optional(),

  // --- Itens da Anamnese (Detalhe) ---
  items: z.array(anamneseItemSchema).min(1, 'A anamnese deve ter pelo menos um exame.'),
});

export type AnamneseItemForm = z.infer<typeof anamneseItemSchema>;
export type UpsertAnamneseForm = z.infer<typeof upsertAnamneseSchema>;
