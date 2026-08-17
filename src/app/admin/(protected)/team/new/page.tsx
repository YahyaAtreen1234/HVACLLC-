import { PageHeader } from "../../../ui";
import { TeamForm } from "../TeamForm";

export const dynamic = "force-dynamic";

export default function NewTeamMemberPage() {
  return (
    <>
      <PageHeader title="Add a team member" />
      <TeamForm />
    </>
  );
}
