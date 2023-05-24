import { Button, DataTable, Form, HorizontalGrid, LegacyCard, Select, Spinner, TextField } from "@shopify/polaris";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useRedistributeComponentsInLocation, useUpdateComponentsInLocation } from "../hooks/mutations";
import { ComponentLocations, useComponentLocations, useProductInventories } from "../hooks/queries";
import { useFormField } from "../hooks/useFormField";

export const OverviewByLocationCard = () => {
  return (
    <LegacyCard>
      <OverviewByLocationCardBody />
    </LegacyCard>
  );
};

export const OverviewByLocationCardBody = ({}) => {
  const { id } = useParams();
  const [selectedLocation, setSelectedLocation] = useState<ComponentLocations | null>(null); // [locationId, setLocationId
  const quantityField = useFormField(`${selectedLocation?.inStock}`);

  const { mutate: redistribute, isLoading: isRedistributing } = useRedistributeComponentsInLocation();
  const { mutate: updateInStock, isLoading: isUpdating } = useUpdateComponentsInLocation();
  const { data: locations = [], isError, isLoading, isSuccess } = useComponentLocations(id);
  const { data: productsInLocation = [], isLoading: isProductsLoading } = useProductInventories({
    locationId: selectedLocation?.externalLocationId,
    componentId: id,
  });

  const isRedistributeDisabled = !selectedLocation || productsInLocation.length === 0;
  const isDataUpdating = isUpdating || isRedistributing;
  const locationOptions = locations.map(({ externalLocationId, location: { name } }) => ({
    value: externalLocationId,
    label: name,
  }));

  const onSelectChange = (locationId: string) => {
    const location = locations.find((location) => location.externalLocationId === locationId);
    setSelectedLocation(location ?? null);
  };

  const handleSaveClick = () => {
    updateInStock({
      componentId: id!,
      inStock: Number(quantityField.value),
      locationId: selectedLocation?.location?.externalId!,
    });
  };

  const handleRedistributeClick = () => {
    redistribute({
      componentId: id!,
      locationId: selectedLocation?.location?.externalId!,
    });
  };

  useEffect(() => {
    if (locations.length > 0) {
      setSelectedLocation(locations[0]);
      return;
    }
  }, [isSuccess]);

  useEffect(() => {
    quantityField.onChange(`${selectedLocation?.inStock}`);
  }, [selectedLocation]);

  if (isError) return <div>Something went wrong</div>;
  if (isLoading)
    return (
      <div style={{ width: "100%", display: "flex", justifyContent: "center", minHeight: "10rem", alignItems: "center" }}>
        <Spinner />
      </div>
    );

  return (
    <>
      <LegacyCard.Header title="Overview by Location">
        <Select
          label="Location"
          labelInline
          options={locationOptions}
          onChange={onSelectChange}
          value={selectedLocation?.externalLocationId}
        />
      </LegacyCard.Header>
      <LegacyCard.Section>
        <HorizontalGrid columns={3}>
          <Form onSubmit={handleSaveClick}>
            <TextField
              type="number"
              label="Components In Stock"
              autoComplete="off"
              connectedRight={
                <Button loading={isDataUpdating} submit>
                  Update
                </Button>
              }
              {...quantityField}
            />
          </Form>
          <div></div>
          <div style={{ marginBottom: 0, marginTop: "auto", display: "flex", justifyContent: "end" }}>
            <Button loading={isDataUpdating} onClick={handleRedistributeClick} disabled={isRedistributeDisabled}>
              Redistribute
            </Button>
          </div>
        </HorizontalGrid>
        {isProductsLoading ? (
          <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", height: "10rem" }}>
            <Spinner />
          </div>
        ) : (
          <DataTable
            headings={["Product", "Variant", "In Stock"]}
            columnContentTypes={["text", "text", "numeric"]}
            rows={
              productsInLocation.length > 0
                ? productsInLocation.map(({ productName, variantName, inStock }) => [productName, variantName, inStock])
                : [["No products in this location"]]
            }
          />
        )}
      </LegacyCard.Section>
    </>
  );
};
