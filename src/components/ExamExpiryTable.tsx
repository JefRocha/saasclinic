'use client';
// components/ExamExpiryTable.tsx
// --------------------------------------------------------
// Componente de UI para exibir exames que estão vencendo / vencidos.
// NÃO depende de Drizzle ou do banco; basta receber um array tipado.
// --------------------------------------------------------
import { useMemo } from 'react';

export interface ExamRecord {
  id: string;
  employeeName: string;
  examType: string;
  performedAt: string; // ISO string – data em que o exame foi feito
  validityMonths: number; // Quantidade de meses que o exame vale
}

// --- Helpers --------------------------------------------------------
const getExpiryDate = (performedAt: string, validityMonths: number): Date => {
  const date = new Date(performedAt);
  const d = new Date(date.getTime());
  d.setMonth(d.getMonth() + validityMonths);
  return d;
};

const diffInDays = (a: Date, b: Date): number => {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.floor((a.getTime() - b.getTime()) / MS_PER_DAY);
};

// --- UI -------------------------------------------------------------
export function ExamExpiryTable({ records }: { records: ExamRecord[] }) {
  const today = useMemo(() => new Date(), []);
  const enriched = useMemo(() => {
    return records
      .map((r) => {
        const expiry = getExpiryDate(r.performedAt, r.validityMonths);
        const daysLeft = diffInDays(expiry, today);
        const status: 'valid' | 'expiring' | 'expired' =
          daysLeft <= 0 ? 'expired' : daysLeft <= 30 ? 'expiring' : 'valid';
        return { ...r, expiry, daysLeft, status };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [records, today]);

  const rowStyle = (s: string) =>
    s === 'expired'
      ? 'bg-red-50 text-red-700'
      : s === 'expiring'
      ? 'bg-yellow-50 text-yellow-800'
      : '';

  return (
    <div className="overflow-x-auto rounded-2xl shadow-md">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left">Colaborador</th>
            <th className="px-4 py-2 text-left">Tipo de Exame</th>
            <th className="px-4 py-2 text-left">Realizado em</th>
            <th className="px-4 py-2 text-left">Vence em</th>
            <th className="px-4 py-2 text-left">Dias Restantes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {enriched.map((r) => (
            <tr key={r.id} className={rowStyle(r.status)}>
              <td className="px-4 py-2 whitespace-nowrap">{r.employeeName}</td>
              <td className="px-4 py-2">{r.examType}</td>
              <td className="px-4 py-2">
                {new Date(r.performedAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-2">{r.expiry.toLocaleDateString()}</td>
              <td className="px-4 py-2 text-center">{r.daysLeft}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ====================================================================
 * EXEMPLO DE USO COM DRIZZLE + NEXT.JS 15 (Server Component)
 * Coloque o arquivo abaixo em `app/exams/page.tsx` ou similar.
 * ==================================================================== */

// import { ExamExpiryTable, ExamRecord } from '@/components/ExamExpiryTable';
// import { db } from '@/lib/db'; // sua instância Drizzle
// import { anamneseItemsTable, examesTable, colaboradorTable } from '@/db/schema';
// import { eq } from 'drizzle-orm';
//
// export const dynamic = 'force-dynamic'; // garante SSR sempre atualizado
//
// export default async function ExamsExpiryPage() {
//   /*
//    * 1. Buscar dados mínimos.
//    *    - anamnese_items.data          -> performedAt
//    *    - exames.validade              -> validityMonths
//    *    - colaborador.name             -> employeeName
//    *    - exames.tipo                  -> examType
//    */
//   const rows = await db
//     .select({
//       id: anamneseItemsTable.id,
//       employeeName: colaboradorTable.name,
//       examType: examesTable.tipo,
//       performedAt: anamneseItemsTable.data,
//       validityMonths: examesTable.validade, // Ex: 12 meses
//     })
//     .from(anamneseItemsTable)
//     .innerJoin(examesTable, eq(anamneseItemsTable.exameId, examesTable.id))
//     .innerJoin(
//       colaboradorTable,
//       eq(anamneseItemsTable.colaboradorId, colaboradorTable.id),
//     );
//
//   // 2. Adaptar ao shape que o componente espera.
//   const records: ExamRecord[] = rows.map((r) => ({
//     id: String(r.id),
//     employeeName: r.employeeName,
//     examType: r.examType,
//     performedAt: r.performedAt?.toISOString() ?? new Date().toISOString(),
//     validityMonths: r.validityMonths ?? 0,
//   }));
//
//   // 3. Renderizar na página.
//   return (
//     <div className="p-6 space-y-6">
//       <h1 className="text-2xl font-bold">Vencimento de Exames</h1>
//       <ExamExpiryTable records={records} />
//     </div>
//   );
// }

/* --------------------------------------------------------------------
 * DICA – Job Diurno para Atualizar Status e Notificar
 * --------------------------------------------------------------------
 *   import { CronJob } from 'node-cron';
 *   new CronJob('0 7 * * *', async () => {
 *     const today = new Date();
 *     // query para pegar exames vencidos hoje e mandar e‑mail.
 *   }).start();
 * ------------------------------------------------------------------ */
