import { notFound } from "next/navigation";
import { servicesStore } from "@/server/content/store";
import { PageHeader } from "../../../ui";
import { DeleteServiceForm, ServiceForm } from "../ServiceForm";

export const dynamic = "force-dynamic";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = servicesStore.byId(id);

  if (!service) notFound();

  return (
    <>
      <PageHeader
        title={`Edit ${service.name}`}
        description={`Live at /services/${service.slug}`}
      />
      <ServiceForm service={service} />
      <DeleteServiceForm id={service.id} />
    </>
  );
}
