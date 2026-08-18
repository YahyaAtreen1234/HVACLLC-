import { notFound } from "next/navigation";
import { areasStore } from "@/server/content/store";
import { PageHeader } from "../../../ui";
import { AreaForm, DeleteAreaForm } from "../AreaForm";

export const dynamic = "force-dynamic";

export default async function EditAreaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const area = await areasStore.byId(id);

  if (!area) notFound();

  return (
    <>
      <PageHeader title={`Edit ${area.city}`} description={`${area.city}, ${area.state}`} />
      <AreaForm area={area} />
      <DeleteAreaForm id={area.id} />
    </>
  );
}
