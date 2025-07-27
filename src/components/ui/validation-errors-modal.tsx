'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type ErrorMessage = string;

const ValidationModalCtx = createContext<
  (messages: ErrorMessage[]) => Promise<void>
>(() => Promise.resolve());

export function ValidationErrorsModalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [messages, setMessages] = useState<ErrorMessage[] | null>(null);
  const [resolvePromise, setResolvePromise] = useState<{
    resolve: () => void;
  } | null>(null);

  const openModal = useCallback((msgs: ErrorMessage[]): Promise<void> => {
    return new Promise((resolve) => {
      setMessages(msgs);
      setResolvePromise({ resolve });
    });
  }, []);

  const handleClose = () => {
    if (resolvePromise) {
      resolvePromise.resolve();
    }
    setMessages(null);
    setResolvePromise(null);
  };

  return (
    <ValidationModalCtx.Provider value={openModal}>
      {children}

      <Dialog open={!!messages && messages.length > 0} onOpenChange={handleClose}>
        <DialogContent className="w-[400px] p-4" hideCloseButton>
          <div className="flex items-center gap-4">
            <div>
              <AlertCircle className="h-12 w-12 text-yellow-500" />
            </div>

            <div className="flex-1">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-yellow-600">
                  Campos Obrigatórios
                </DialogTitle>
              </DialogHeader>

              <ul className="mt-2 list-disc pl-5 text-base text-gray-700">
                {messages?.map((msg, index) => (
                  <li key={index}>{msg}</li>
                ))}
              </ul>

              <div className="mt-4 flex justify-end">
                <Button onClick={handleClose}>Ok</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ValidationModalCtx.Provider>
  );
}

export const useValidationErrorsModal = () => useContext(ValidationModalCtx);
