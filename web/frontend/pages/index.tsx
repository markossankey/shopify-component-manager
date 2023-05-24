import { useNavigate } from "@shopify/app-bridge-react";
import { Button, DataTable, Layout, Link, Page } from "@shopify/polaris";
import { useComponents } from "../hooks/queries";

export default function HomePage() {
  const navigate = useNavigate();
  const { data: components = [[]] } = useComponents({
    select: (components) =>
      components.map(({ id, createdAt, name }) => [
        <Link onClick={() => navigate(`/component/${id}`)}>{name}</Link>,
        `${createdAt}`,
        "X",
        "X",
      ]),
  });

  return (
    <Page
      title="Components Overview"
      actionGroups={[{ title: "Placeholder", actions: [{ content: "Action 1" }, { content: "Action 2" }] }]}
      primaryAction={
        <Button primary onClick={() => navigate("/component")}>
          Create New
        </Button>
      }
    >
      <Layout>
        <Layout.Section>
          <DataTable
            headings={["Name", "Locations", "Connected Products", "Total Inventory"]}
            columnContentTypes={["text", "numeric", "numeric", "numeric"]}
            rows={
              components.length > 0
                ? components
                : [
                    [
                      <>
                        No components exist yet, <Link onClick={() => navigate("/component")}>create one?</Link>
                      </>,
                    ],
                  ]
            }
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
