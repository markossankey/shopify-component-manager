import {
  Button,
  DataTable,
  Form,
  FormLayout,
  Icon,
  LegacyCard,
  Modal,
  Select,
  Spinner,
  Text,
  TextField,
  VerticalStack,
} from "@shopify/polaris";
import { DeleteMinor, PlusMinor } from "@shopify/polaris-icons";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCreateComponentProduct, useDeleteProductConnection } from "../hooks/mutations";
import { useComponentProducts, useProducts } from "../hooks/queries";
import { useFormField } from "../hooks/useFormField";

//TODO: Add product connection
export const ProductsCard = () => {
  return (
    <LegacyCard
      title={
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Text as="h2" variant="headingMd">
            Products
          </Text>
          <NewProductConnectionForm />
        </div>
      }
      sectioned
    >
      <FormLayout>
        <FormLayout.Group>
          <Products />
        </FormLayout.Group>
      </FormLayout>
    </LegacyCard>
  );
};

const Products = () => {
  const { id } = useParams();
  const { data: productConnections, isError, isLoading } = useComponentProducts(id);

  if (isError) return <div>Something went wrong</div>;
  if (isLoading)
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Spinner />
      </div>
    );

  return (
    <DataTable
      columnContentTypes={["text", "text", "numeric", "numeric", "text"]}
      headings={["Product", "Variant", "Components", "In Stock", ""]}
      rows={productConnections?.map((productConnection) => [
        productConnection.variant.product.name,
        productConnection.variant.name,
        productConnection.componentsPerVariant,
        productConnection.variant.locations.reduce((acc, location) => acc + location.inStock, 0),
        <ProductActions variantId={productConnection.externalVariantId} />,
      ])}
    />
  );
};

const NewProductConnectionForm = () => {
  const { id } = useParams();
  const [isOpen, setIsOpen] = useState(false);
  const selectedProductId = useFormField("");
  const selectedVariantId = useFormField("");
  const quantity = useFormField(undefined);
  const { mutate: addProductConnection } = useCreateComponentProduct();

  const { data: products, isError, isLoading } = useProducts();

  const variants = selectedProductId.value ? products?.find(({ id }) => id === selectedProductId.value)?.variants : [];
  const variantOptions = variants?.map(({ name, id }) => ({
    label: name,
    value: id,
  }));
  const isVariantDisabled = !selectedProductId.value || (variantOptions && variantOptions?.length < 2);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const resetForm = () => {
    selectedProductId.onChange("");
    selectedVariantId.onChange("");
    quantity.onChange(undefined);
  };

  const onSave = () => {
    if (selectedProductId && selectedVariantId && quantity) {
      addProductConnection({
        componentId: id!,
        variantId: selectedVariantId.value,
        quantity: parseInt(quantity.value!),
      });
      resetForm();
      toggleOpen();
    }
  };

  // when products are loaded, default to the first product
  useEffect(() => {
    if (products && products.length > 0) {
      selectedProductId.onChange(products[0].id);
    }
  }, [products]);

  // when a product is selected, default to the first variant
  useEffect(() => {
    if (selectedProductId.value) {
      selectedVariantId.onChange(variantOptions?.[0].value!);
    }
  }, [selectedProductId.value]);

  if (isError || !id) return <div>Something went wrong</div>;
  if (isLoading) return null;

  const activator = <Button size="slim" onClick={toggleOpen} icon={PlusMinor} />;

  return (
    <Modal
      activator={activator}
      open={isOpen}
      onClose={toggleOpen}
      title="Add new product connection"
      primaryAction={{
        content: "Save",
        onAction: onSave,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: toggleOpen,
        },
      ]}
    >
      <Modal.Section>
        <Form onSubmit={onSave}>
          <VerticalStack gap={"5"}>
            <Select
              label="Product"
              {...selectedProductId}
              options={products?.map((product) => ({
                label: product.name,
                value: product.id,
              }))}
            />
            <Select label="Variant" {...selectedVariantId} disabled={isVariantDisabled} options={variantOptions} />
            <TextField label="Components in each" {...quantity} type="number" autoComplete="off" />
          </VerticalStack>
        </Form>
      </Modal.Section>
    </Modal>
  );
};

const ProductActions = ({ variantId }: { variantId: string }) => {
  const { id } = useParams();

  const { mutate: deleteProductConnection } = useDeleteProductConnection();

  const onDeleteClick = () => {
    deleteProductConnection({ componentId: id!, variantId });
  };

  return (
    <div style={{ width: "100%", position: "relative" }}>
      <span aria-label="button" style={{ position: "absolute", right: "0" }} onClick={onDeleteClick}>
        <Icon source={DeleteMinor} color="critical" />
      </span>
    </div>
  );
};
