import { Button, Form, FormLayout, Layout, LegacyCard, Page, TextField } from "@shopify/polaris";
import { useCreateComponent } from "../../hooks/mutations";
import { useFormField } from "../../hooks/useFormField";

export default function New({}) {
  const componentNameField = useFormField("");
  const { mutate: createComponent } = useCreateComponent();

  const onSubmit = () => {
    createComponent({ name: componentNameField.value });
  };

  return (
    <Page title="New Component" backAction={{ url: "/", content: "Back" }}>
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
                    connectedRight={<Button submit>Create</Button>}
                  />
                </FormLayout.Group>
              </FormLayout>
            </Form>
          </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
