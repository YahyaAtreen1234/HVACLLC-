import { PageHeader } from "../../../ui";
import { ServiceForm } from "../ServiceForm";

export const dynamic = "force-dynamic";

export default function NewServicePage() {
  return (
    <>
      <PageHeader
        title="Add a service"
        description="This creates a page, a card, a footer link and a contact-form option."
      />
      <ServiceForm />
    </>
  );
}
