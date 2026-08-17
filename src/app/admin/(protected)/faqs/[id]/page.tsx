import { notFound } from "next/navigation";
import { faqsStore } from "@/server/content/store";
import { PageHeader } from "../../../ui";
import { DeleteFaqForm, FaqForm } from "../FaqForm";

export const dynamic = "force-dynamic";

export default async function EditFaqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const faq = faqsStore.byId(id);

  if (!faq) notFound();

  return (
    <>
      <PageHeader title="Edit question" description={faq.question} />
      <FaqForm faq={faq} />
      <DeleteFaqForm id={faq.id} />
    </>
  );
}
