"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { UpsertUserSchema, upsertUserSchema } from "@/actions/users/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function UpsertUserForm({
  onSuccess,
  defaultValues,
  onSubmitUser,
}: {
  onSuccess?: (data?: UpsertUserSchema) => void;
  defaultValues?: Partial<UpsertUserSchema>;
  onSubmitUser: (data: UpsertUserSchema) => Promise<void>;
}) {
  const form = useForm<UpsertUserSchema>({
    resolver: zodResolver(upsertUserSchema),
    defaultValues,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: UpsertUserSchema) => {
    setIsLoading(true);
    setError(null);
    try {
      await onSubmitUser(data);
      form.reset();
      onSuccess?.(data);
    } catch (err: any) {
      setError(err.message || "Erro ao salvar usuário");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="email"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {defaultValues?.id ? "Salvar" : "Criar"} Usuário
        </Button>
        {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
      </form>
    </Form>
  );
}
