import { useState, useCallback } from "react";

type ActionState<TOutput> = {
  data?: TOutput;
  error?: string;
  isLoading: boolean;
};

type ServerActionResult<TOutput> = {
  data?: TOutput;
  error?: string;
  success?: boolean;
};

type ServerAction<TInput, TOutput> = (input: TInput) => Promise<ServerActionResult<TOutput>>;

export function useServerAction<TInput, TOutput>(
  action: ServerAction<TInput, TOutput>
) {
  const [state, setState] = useState<ActionState<TOutput>>({
    isLoading: false,
  });

  const execute = useCallback(
    async (input: TInput): Promise<ServerActionResult<TOutput>> => {
      setState(prev => ({ ...prev, isLoading: true, error: undefined }));

      try {
        const result = await action(input);
        
        if (result.error) {
          setState({ isLoading: false, error: result.error });
          return { error: result.error };
        }

        setState({ isLoading: false, data: result.data });
        return { data: result.data, success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        setState({ isLoading: false, error: errorMessage });
        return { error: errorMessage };
      }
    },
    [action]
  );

  const reset = useCallback(() => {
    setState({ isLoading: false, data: undefined, error: undefined });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}