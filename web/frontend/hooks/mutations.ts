import { useNavigate } from "@shopify/app-bridge-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthenticatedFetch } from ".";
import { URLs } from "./queries";
import { jsonRequest } from "./utils";

export function useCreateComponent() {
  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (component: { name: string }) => fetch("/api/component", jsonRequest("POST", component)),
    onSuccess: async (data) => {
      const body = await data.json();
      navigate(`/component/${body.id}`);
      queryClient.invalidateQueries([URLs.useComponents]);
    },
  });
}

export function useUpdateComponentsInLocation() {
  const fetch = useAuthenticatedFetch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ componentId, locationId, inStock }: { componentId: string; locationId: string; inStock: number }) =>
      fetch(`/api/component/${componentId}/location/${locationId}`, jsonRequest("PATCH", { inStock })),
    onSuccess: (_, ctx) => {
      queryClient.invalidateQueries([URLs.useComponentLocations(ctx.componentId)]);
    },
  });
}

export function useCreateComponentProduct() {
  const fetch = useAuthenticatedFetch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ componentId, variantId, quantity }: { componentId: string; variantId: string; quantity: number }) =>
      fetch(`/api/component/${componentId}/product/${variantId}`, jsonRequest("POST", { quantity })),
    onSuccess: (_, ctx) => {
      queryClient.invalidateQueries([URLs.useComponentProducts(ctx.componentId)]);
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) => {
          if (typeof queryKey[0] === "string") {
            return queryKey[0].includes("product");
          }
          return false;
        },
      });
    },
  });
}

export function useRedistributeComponentsInLocation() {
  const fetch = useAuthenticatedFetch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ componentId, locationId }: { componentId: string; locationId: string }) =>
      fetch(`/api/component/${componentId}/locations/${locationId}/product?redistribute=true`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) => {
          if (typeof queryKey[0] === "string") {
            return queryKey[0].includes("product");
          }
          return false;
        },
      });
    },
  });
}

export function useDeleteProductConnection() {
  const fetch = useAuthenticatedFetch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ componentId, variantId }: { componentId: string; variantId: string }) =>
      fetch(`/api/component/${componentId}/product/${variantId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) => {
          if (typeof queryKey[0] === "string") {
            return queryKey[0].includes("product");
          }
          return false;
        },
      });
    },
  });
}
