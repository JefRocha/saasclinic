'use server';

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { colaboradorTable } from "@/models/Schema";
import { protectedAction, ActionError } from "@/libs/safe-action";
import { upsertColaboradorSchema } from "./schema";
import { buildAbility, Action as CaslAction } from "@/lib/ability";
import { eq } from "drizzle-orm";
import { z } from "zod";

async function handler({
  parsedInput,
  ctx: { userId, orgId }
}: {
  parsedInput: z.infer<typeof upsertColaboradorSchema>;
  ctx: { userId: string; orgId: string; };
}) {
  const user = await currentUser();
  const role = user?.publicMetadata?.role as string;

  const ability = buildAbility(role, orgId);
  const isEditing = !!parsedInput.id;

  // 1. Verificar permissão
  const actionToPerform = isEditing ? CaslAction.Update : CaslAction.Create;
  if (!ability.can(actionToPerform, "Colaborador")) {
    throw new ActionError("Você não tem permissão para realizar esta ação.");
  }

  // 2. Decidir em qual organização gravar (orgId já vem do contexto)
  const finalOrgId = orgId;

  // 3. Preparar os dados para o banco (mapeamento explícito para segurança)
  const colaboradorData = {
    id: parsedInput.id,
    organizationId: finalOrgId,
    name: parsedInput.name,
    email: parsedInput.email,
    endereco: parsedInput.endereco || null,
    numero: parsedInput.numero || null,
    complemento: parsedInput.complemento || null,
    bairro: parsedInput.bairro || null,
    cidade: parsedInput.cidade || null,
    uf: parsedInput.uf || null,
    cep: parsedInput.cep || null,
    telefone: parsedInput.telefone || null,
    celular: parsedInput.celular || null,
    cpf: parsedInput.cpf || null,
    rg: parsedInput.rg || null,
    ctps: parsedInput.ctps || null,
    data_admissao: parsedInput.data_admissao || null,
    data_demissao: parsedInput.data_demissao || null,
    situacao: parsedInput.situacao || null,
    obs1: parsedInput.obs1 || null,
    data_nascimento: parsedInput.data_nascimento || null,
    setor: parsedInput.setor || null,
    cargahoraria: parsedInput.cargahoraria || null,
    prontuario: parsedInput.prontuario || null,
    observacao: parsedInput.observacao || null,
    pcd: parsedInput.pcd || null,
    cod_anterior: parsedInput.cod_anterior || null,
    phoneNumber: parsedInput.phoneNumber,
    sex: parsedInput.sex,
  };

  try {
    if (isEditing) {
      // Atualização
      const [updatedColaborador] = await db
        .update(colaboradorTable)
        .set(colaboradorData)
        .where(eq(colaboradorTable.id, Number(parsedInput.id)))
        .returning();

      if (!updatedColaborador) {
        throw new ActionError("Colaborador não encontrado para atualização.");
      }
      return updatedColaborador;
    } else {
      // Inserção
      const [newColaborador] = await db
        .insert(colaboradorTable)
        .values(colaboradorData)
        .returning();
      
      return newColaborador;
    }
  } catch (error) {
    console.error("Erro ao salvar colaborador:", error);
    throw new ActionError("Ocorreu um erro inesperado ao salvar o colaborador.");
  }
}

export const upsertColaborador = protectedAction.schema(upsertColaboradorSchema).action(handler);
