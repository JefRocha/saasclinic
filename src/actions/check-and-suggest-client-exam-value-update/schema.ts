import { z } from 'zod';

export const checkAndSuggestClientExamValueUpdateSchema = z.object({
  clientId: z.number(),
  exameId: z.number(),  newAnamneseItemValue: z.number(),
});

export type CheckAndSuggestClientExamValueUpdateInput = z.infer<typeof checkAndSuggestClientExamValueUpdateSchema>;

export type ExamValueUpdateSuggestion = {
  clientId: number;
  exameId: number;
  currentClientExamValue: number;
  newAnamneseItemValue: number;
};

export type CheckAndSuggestClientExamValueUpdateResult = {
  suggestion: ExamValueUpdateSuggestion | null;
};