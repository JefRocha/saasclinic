'use server';

import { and, eq, ilike, asc, desc, gte, lte, sql, AnyColumn } from 'drizzle-orm';
import ptBRMessages from '@/locales/pt-BR.json';


import { anamneseTable, clientsTable, colaboradorTable } from '@/models/Schema';
import { db } from '@/libs/DB';
import { ActionError } from '@/libs/action-error';
import { protectedAction } from '@/libs/safe-action';
import { z } from 'zod';

// Schema de entrada para a action (se houver filtros, paginação, etc.)
const GetAnamnesesSchema = z.object({
  search: z.string().optional(),
  orderBy: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const getAnamneses = protectedAction
  .schema(GetAnamnesesSchema)
  .action(async ({ parsedInput: { search, orderBy, order, startDate, endDate }, ctx: { orgId } }) => {
    
    const t = (key: string) => {
      const keys = key.split('.');
      let current: any = ptBRMessages;
      for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
          current = current[k];
        } else {
          return key; // Fallback para a chave se não encontrada
        }
      }
      return current;
    };

    if (!orgId) {
      throw new ActionError(t('Errors.unauthorized'));
    }

    try {
      const orderByColumn = (() => {
        switch (orderBy) {
          case "clienteNome":
            return clientsTable.razaoSocial;
          case "colaboradorNome":
            return colaboradorTable.name;
          case "id":
            return anamneseTable.id;
          case "total":
            return anamneseTable.total;
          case "tipo":
            return anamneseTable.tipo;
          case "cargo":
            return anamneseTable.cargo;
          default:
            return anamneseTable.id; // Default sorting column
        }
      })();

      
        const whereConditions = [
          eq(anamneseTable.organizationId, orgId),
        ];

        if (search) {
          const searchConditions = [];

          if (anamneseTable.cargo) {
            searchConditions.push(ilike(anamneseTable.cargo, `%${search}%`));
          }
          if (clientsTable.razaoSocial) {
            searchConditions.push(ilike(clientsTable.razaoSocial, `%${search}%`));
          }
          if (colaboradorTable.name) {
            searchConditions.push(ilike(colaboradorTable.name, `%${search}%`));
          }

          if (searchConditions.length > 0) {
            whereConditions.push(sql.raw(`(${searchConditions.map(c => c).join(" OR ")})`));
          }
        }

        if (startDate) {
          whereConditions.push(gte(anamneseTable.data, new Date(startDate)));
        }
        if (endDate) {
          whereConditions.push(lte(anamneseTable.data, new Date(endDate)));
        }

        const anamneses = await db
          .select({
            id: anamneseTable.id,
            clienteNome: clientsTable.razaoSocial,
            colaboradorNome: colaboradorTable.name,
            total: anamneseTable.total,
            tipo: anamneseTable.tipo,
            cargo: anamneseTable.cargo,
            data: anamneseTable.data,
            formaPagto: anamneseTable.formaPagto,
            createdAt: anamneseTable.createdAt,
            updatedAt: anamneseTable.updatedAt,
          })
          .from(anamneseTable)
          .leftJoin(clientsTable, eq(anamneseTable.clienteId, clientsTable.id))
          .leftJoin(colaboradorTable, eq(anamneseTable.colaboradorId, colaboradorTable.id))
          .where(and(...whereConditions))
          .orderBy(
            order === "asc" ? asc(orderByColumn as AnyColumn) : desc(orderByColumn as AnyColumn)
          );

      return { success: true, data: anamneses };
    } catch (error) {
      console.error("Erro ao buscar anamneses:", error);
      throw new ActionError(t('Errors.database_error'));
    }
  }
);