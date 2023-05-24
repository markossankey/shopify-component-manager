import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Sets up the QueryClientProvider from @tanstack/react-query.
 * @desc See: https://@tanstack/react-query.tanstack.com/reference/QueryClientProvider#_top
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const client = new QueryClient({
    queryCache: new QueryCache(),
    mutationCache: new MutationCache(),
  });

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

type QueryProviderProps = {
  children: React.ReactNode;
};
