import { PageHeader } from "../../../ui";
import { AreaForm } from "../AreaForm";

export const dynamic = "force-dynamic";

export default function NewAreaPage() {
  return (
    <>
      <PageHeader title="Add a service area" />
      <AreaForm />
    </>
  );
}
