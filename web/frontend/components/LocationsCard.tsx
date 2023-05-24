import { Button, LegacyCard, Spinner, Text, TextField, VerticalStack } from "@shopify/polaris";
import { useParams } from "react-router-dom";
import { useUpdateComponentsInLocation } from "../hooks/mutations";
import { ComponentLocations, useComponentLocations } from "../hooks/queries";
import { useFormField } from "../hooks/useFormField";

export const LocationsCard = ({}) => {
  return (
    <LegacyCard title="Locations" sectioned>
      <Locations />
    </LegacyCard>
  );
};

const Locations = () => {
  const { id } = useParams();
  const { data: locations, isError, isLoading } = useComponentLocations(id);

  if (isError) return <div>Something went wrong</div>;
  if (isLoading)
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Spinner />
      </div>
    );

  return (
    <>
      {/* <Select label="Location" options={locations.map(())} /> */}
      <VerticalStack gap={"5"}>
        {locations?.map((location) => (
          <LocationField location={location} key={location.id} />
        ))}
      </VerticalStack>
    </>
  );
};

const LocationField = ({ location }: { location: ComponentLocations }) => {
  const quantityField = useFormField(`${location.inStock}`);
  const { mutate: updateInStock } = useUpdateComponentsInLocation();

  const handleSaveClick = () => {
    updateInStock({
      componentId: location.componentId,
      inStock: Number(quantityField.value),
      locationId: location.externalLocationId,
    });
  };

  return (
    <TextField
      connectedRight={
        <Button primary onClick={handleSaveClick}>
          Save
        </Button>
      }
      type="number"
      label={
        <Text as="span">
          <Text as="span" fontWeight="semibold">
            {location.location.name}
          </Text>{" "}
          - Quantity
        </Text>
      }
      autoComplete="off"
      {...quantityField}
    />
  );
};
