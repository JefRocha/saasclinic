import { useAction as useSafeAction } from "next-safe-action/hooks";
import { toast } from "sonner";

interface UseActionOptions<TData, TError> {
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
  onExecute?: () => void;
}

export const useAction = <TInput, TData, TError>(
  action: (input: TInput) => Promise<{ data?: TData; error?: TError }>,
  options?: UseActionOptions<TData, TError>,
) => {
  const { execute, status, result, reset } = useSafeAction(action, {
    onSuccess: (result) => {
      if (result.data && options?.onSuccess) {
        options.onSuccess(result.data);
      }
    },
    onError: (error) => {
      const errorMessage =
        typeof error === "object" && error !== null && "serverError" in error
          ? (error as { serverError: string }).serverError
          : "Ocorreu um erro inesperado.";
      toast.error(errorMessage);
      if (options?.onError) {
        options.onError(error);
      }
    },
    onExecute: () => {
      if (options?.onExecute) {
        options.onExecute();
      }
    },
  });

  return {
    execute,
    isLoading: status === "executing",
    data: result?.data,
    reset,
  };
};
