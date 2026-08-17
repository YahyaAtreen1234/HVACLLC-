import { PageHeader } from "../../../ui";
import { FaqForm } from "../FaqForm";

export const dynamic = "force-dynamic";

export default function NewFaqPage() {
  return (
    <>
      <PageHeader title="Add a question" />
      <FaqForm />
    </>
  );
}
