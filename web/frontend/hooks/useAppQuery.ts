import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAuthenticatedFetch } from "./useAuthenticatedFetch";

/**
 * A hook for querying your custom app data.
 * @desc A thin wrapper around useAuthenticatedFetch and @tanstack/react-query's useQuery.
 *
 * @param {Object} options - The options for your query. Accepts 3 keys:
 *
 * 1. url: The URL to query. E.g: /api/widgets/1`
 * 2. fetchInit: The init options for fetch.  See: https://developer.mozilla.org/en-US/docs/Web/API/fetch#parameters
 * 3. reactQueryOptions: The options for `useQuery`. See: https://@tanstack/react-query.tanstack.com/reference/useQuery
 *
 * @returns Return value of useQuery.  See: https://@tanstack/react-query.tanstack.com/reference/useQuery.
 */
export function useAppQuery<FetchResponse = unknown, AfterSelect = FetchResponse>({
  url,
  fetchInit = {},
  select,
}: UseAppQueryParams<FetchResponse, AfterSelect>) {
  const authenticatedFetch = useAuthenticatedFetch();
  const fetch = useMemo(() => {
    return async () => {
      const response = await authenticatedFetch(url, fetchInit);
      return response.json();
    };
  }, [url, JSON.stringify(fetchInit)]);

  return useQuery({
    queryKey: [url],
    queryFn: fetch,
    refetchOnWindowFocus: false,
    select,
  });
}
/* //TODO - create a folder with hooks just for performing api calls to backend 
-- this will allow use to use useQuery for each call and still have type safety */

interface UseAppQueryParams<U, T> {
  url: RequestInfo;
  fetchInit?: RequestInit;
  select?: (data: U) => T;
}
