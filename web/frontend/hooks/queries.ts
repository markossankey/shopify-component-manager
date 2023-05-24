import { Component, ComponentsInLocations, ComponentsInVariants, Location, Product, Variant } from "@prisma/client";
import { useAppQuery } from "./useAppQuery";

export const URLs = {
  useProducts: "/api/product",
  useComponents: "/api/component",
  useComponent: (id: UrlInputParams) => `/api/component/${id}`,
  useComponentProducts: (id: UrlInputParams) => `/api/component/${id}/product`,
  useComponentLocations: (id: UrlInputParams) => `/api/component/${id}/location`,
  useProductInventories: (locationId: UrlInputParams, componentId: UrlInputParams) =>
    `/api/location/${locationId}/component/${componentId}/product`,
} as const;

export function useProducts() {
  return useAppQuery<ProductWithVariants[]>({
    url: URLs.useProducts,
  });
}

export function useComponents<Result = Component[]>({ select }: { select?: (data: Component[]) => Result } = {}) {
  return useAppQuery<Component[], Result>({
    url: URLs.useComponents,
    select,
  });
}

export function useComponent(id: UrlInputParams) {
  return useAppQuery<ComponentWithVariantsAndLocoations>({
    url: URLs.useComponent(id),
  });
}

export function useComponentProducts(id: UrlInputParams) {
  return useAppQuery<ComponentVariants[]>({
    url: URLs.useComponentProducts(id),
  });
}

export function useComponentLocations(id: UrlInputParams) {
  return useAppQuery<ComponentLocations[]>({
    url: URLs.useComponentLocations(id),
  });
}

export function useProductInventories({
  locationId,
  componentId,
}: {
  locationId: UrlInputParams;
  componentId: UrlInputParams;
}) {
  return useAppQuery<UseProductInventoriesFetch, UseProductInventoriesResult>({
    url: URLs.useProductInventories(locationId, componentId),
    select: (data) =>
      data.variants.map(({ variant }) => ({
        productName: variant.product.name,
        variantName: variant.name,
        inStock: variant.locations[0].inStock,
      })),
  });
}

export type ProductWithVariants = Product & { variants: Variant[] };
export type ComponentWithVariantsAndLocoations = Component & {
  variants: ComponentsInVariants[];
  locations: ComponentsInLocations[];
};
export type ComponentLocations = ComponentsInLocations & { location: Location };
export type ComponentVariants = ComponentsInVariants & {
  variant: Variant & { product: { name: string }; locations: { inStock: number }[] };
};

type UrlInputParams = string | number | undefined;

export type UseProductInventoriesFetch = Location & {
  variants: { variant: { name: string; locations: { inStock: number }[]; product: { name: string } } }[];
};

export type UseProductInventoriesResult = { productName: string; variantName: string; inStock: number }[];
