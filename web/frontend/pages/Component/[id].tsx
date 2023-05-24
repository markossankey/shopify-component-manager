import { Button, Form, FormLayout, Layout, LegacyCard, Page, TextField } from "@shopify/polaris";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { ProductsCard } from "../../components";
import { OverviewByLocationCard } from "../../components/OverviewByLocation";
import { useComponent } from "../../hooks/queries";
import { useFormField } from "../../hooks/useFormField";

export default function Component({}) {
  const { id } = useParams();
  const { data: component } = useComponent(id);

  const componentNameField = useFormField("");

  useEffect(() => {
    if (component) {
      componentNameField.onChange(component.name);
    }
  }, [component]);

  const onSubmit = () => {
    console.log("add update functionality");
  };

  return (
    <Page title={component?.name} backAction={{ url: "/", content: "Back" }}>
      <Layout>
        <Layout.Section>
          <LegacyCard sectioned title="General Info">
            <Form onSubmit={onSubmit}>
              <FormLayout>
                <FormLayout.Group>
                  <TextField
                    type="text"
                    label="Component Name"
                    autoComplete="off"
                    {...componentNameField}
                    connectedRight={<Button submit>Update</Button>}
                  />
                </FormLayout.Group>
              </FormLayout>
            </Form>
          </LegacyCard>
        </Layout.Section>
        <Layout.Section>
          <OverviewByLocationCard />
        </Layout.Section>

        <Layout.Section>
          <ProductsCard />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
