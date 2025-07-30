'use client';

import React from 'react';

export type Column = { header: string; key: string };
export type ExporterProps = {
  columns: Column[];
  rows: Record<string, any>[];
  fileBaseName?: string; // ex: 'relatorio_clientes'
  disabledFormats?: Array<'csv' | 'xlsx' | 'pdf'>;
};

function toCSV(columns: Column[], rows: Record<string, any>[]) {
  const head = columns.map(c => `"${c.header.replace(/"/g, '""')}"`).join(',');
  const body = rows
    .map(r =>
      columns
        .map(c => {
          const v = r[c.key];
          const s =
            v == null ? '' :
            v instanceof Date ? v.toISOString() :
            typeof v === 'object' ? JSON.stringify(v) :
            String(v);
          return `"${s.replace(/"/g, '""')}"`;
        })
        .join(',')
    )
    .join('\n');
  return head + '\n' + body;
}

async function exportXLSX(columns: Column[], rows: Record<string, any>[], name: string) {
  const XLSX = await import('xlsx');
  const headers = columns.map(c => c.header);
  const keys = columns.map(c => c.key);
  const data = [headers, ...rows.map(r => keys.map(k => r[k]))];
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Dados');
  XLSX.writeFile(wb, `${name}.xlsx`);
}

async function exportPDF(columns: Column[], rows: Record<string, any>[], name: string) {
  const { default: jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;
  const doc = new jsPDF();
  autoTable(doc, {
    head: [columns.map(c => c.header)],
    body: rows.map(r => columns.map(c => (r[c.key] ?? '').toString())),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [0, 0, 0] },
  });
  doc.save(`${name}.pdf`);
}

export default function Exporter({
  columns,
  rows,
  fileBaseName = 'export',
  disabledFormats = [],
}: ExporterProps) {
  const onCSV = () => {
    const csv = toCSV(columns, rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${fileBaseName}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const onXLSX = async () => exportXLSX(columns, rows, fileBaseName);
  const onPDF = async () => exportPDF(columns, rows, fileBaseName);

  return (
    <div className="inline-flex gap-2">
      {!disabledFormats.includes('csv') && (
        <button onClick={onCSV} className="px-3 py-1.5 text-sm rounded-lg border bg-white hover:bg-gray-50">
          CSV
        </button>
      )}
      {!disabledFormats.includes('xlsx') && (
        <button onClick={onXLSX} className="px-3 py-1.5 text-sm rounded-lg border bg-white hover:bg-gray-50">
          XLSX
        </button>
      )}
      {!disabledFormats.includes('pdf') && (
        <button onClick={onPDF} className="px-3 py-1.5 text-sm rounded-lg border bg-white hover:bg-gray-50">
          PDF
        </button>
      )}
    </div>
  );
}
