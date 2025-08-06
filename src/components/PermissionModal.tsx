// src/components/PermissionModal.tsx
'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { ShieldAlert } from 'lucide-react'; // Ícone mais apropriado
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const ModalCtx = createContext<(msg: string) => Promise<void>>(() =>
  Promise.resolve(),
);

export function PermissionModalProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [resolvePromise, setResolvePromise] = useState<{
    resolve: () => void;
  } | null>(null);

  const openModal = useCallback((msg: string): Promise<void> => {
    return new Promise((resolve) => {
      setMessage(msg);
      setResolvePromise({ resolve });
    });
  }, []);

  const handleClose = () => {
    if (resolvePromise) {
      resolvePromise.resolve();
    }
    setMessage(null);
    setResolvePromise(null);
  };

  return (
    <ModalCtx.Provider value={openModal}>
      {children}

      <Dialog open={!!message} onOpenChange={handleClose}>
        <DialogContent className="w-[300px] p-4" hideCloseButton> {/* Adicionado hideCloseButton */}
          {/* Layout de duas colunas */}
          <div className="flex items-center gap-2">
            {/* Coluna da Esquerda: Ícone */}
            <div>
              <ShieldAlert className="h-12 w-12 text-destructive" />
            </div>

            {/* Coluna da Direita: Conteúdo */}
            <div className="flex-1">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-destructive">
                  Acesso Negado
                </DialogTitle>
              </DialogHeader>

              <p className="mt-2 text-base">{message}</p> {/* Fonte da mensagem aumentada */}

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleClose}
                  className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground"
                >
                  Ok
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ModalCtx.Provider>
  );
}

export const useModal = () => useContext(ModalCtx);