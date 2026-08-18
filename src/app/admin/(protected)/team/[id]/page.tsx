import { notFound } from "next/navigation";
import { teamStore } from "@/server/content/store";
import { PageHeader } from "../../../ui";
import { DeleteTeamForm, TeamForm } from "../TeamForm";

export const dynamic = "force-dynamic";

export default async function EditTeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await teamStore.byId(id);

  if (!member) notFound();

  return (
    <>
      <PageHeader title={`Edit ${member.name}`} description={member.role} />
      <TeamForm member={member} />
      <DeleteTeamForm id={member.id} />
    </>
  );
}
