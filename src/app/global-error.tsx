'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Lê o cookie NEXT_LOCALE no browser */
function getLocaleFromCookie(): string {
  const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
  return match?.[1] ?? 'pt-BR';          // fallback
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const [locale, setLocale] = useState('pt-BR');

  /** Atualiza quando o componente monta */
  useEffect(() => {
    setLocale(getLocaleFromCookie());
  }, []);

  return (
    <html lang={locale}>
      <body className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
        <h1 className="mb-4 text-3xl font-semibold">Algo deu errado 😕</h1>

        <p className="mb-2 max-w-md text-center text-sm text-gray-600">
          {error.message}
        </p>

        <div className="mt-6 flex gap-3">
          <button
            className="rounded bg-black px-4 py-2 text-white"
            onClick={reset}
          >
            Tentar novamente
          </button>

          <Link
            href="/"
            className="rounded border border-black px-4 py-2 text-black"
          >
            Voltar ao início
          </Link>
        </div>
      </body>
    </html>
  );
}
