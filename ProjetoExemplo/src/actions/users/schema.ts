import { z } from "zod";

export const upsertUserSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
});

export type UpsertUserSchema = z.infer<typeof upsertUserSchema>;
