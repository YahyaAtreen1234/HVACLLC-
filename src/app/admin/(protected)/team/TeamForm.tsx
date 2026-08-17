import { deleteTeamMember, saveTeamMember } from "../../actions";
import { Card, Checkbox, Field, SubmitRow, TextArea } from "../../ui";
import type { DbTeamMember } from "@/server/content/store";
import { ImageField } from "../../ImageField";

export function TeamForm({ member }: { member?: DbTeamMember }) {
  const editing = Boolean(member);

  return (
    <form action={saveTeamMember} encType="multipart/form-data" className="space-y-6">
      {member ? <input type="hidden" name="id" value={member.id} /> : null}

      <Card className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Full name"
            name="name"
            required
            defaultValue={member?.name}
            placeholder="Sam Ortega"
            hint="Use the name they want published."
          />
          <Field
            label="Role"
            name="role"
            required
            defaultValue={member?.role}
            placeholder="Owner & Lead Technician"
          />
        </div>

        <TextArea
          label="Short bio"
          name="bio"
          required
          rows={3}
          defaultValue={member?.bio}
          hint="One or two sentences on what they actually do."
        />

        <Field
          label="Certifications"
          name="credentials"
          defaultValue={member?.credentials.join(", ")}
          placeholder="NATE-certified, EPA 608 Universal"
          hint="Comma-separated. Only list certifications this person genuinely holds."
        />
      </Card>

      <Card className="space-y-5">
        <h2 className="font-display text-lg font-bold text-ink-950">Photo</h2>
        <ImageField
          name="image"
          label="Photo"
          currentPath={member?.imageSrc}
          hint="A head-and-shoulders photo works best. JPEG, PNG, WebP or AVIF, up to 8 MB."
        />
        <Field
          label="Alt text"
          name="imageAlt"
          defaultValue={member?.imageAlt}
          hint="Describe the photo for screen readers — for example: Sam, lead technician, in uniform."
        />
      </Card>

      <Card className="space-y-4">
        <div className="grid gap-5 sm:grid-cols-2">
          <Checkbox
            label="Published"
            name="published"
            defaultChecked={member?.published ?? true}
          />
          <Field
            label="Sort order"
            name="sortOrder"
            type="number"
            defaultValue={member?.sortOrder ?? 0}
            hint="Lower numbers appear first."
          />
        </div>
      </Card>

      <SubmitRow
        cancelHref="/admin/team"
        label={editing ? "Save changes" : "Add member"}
      />
    </form>
  );
}

export function DeleteTeamForm({ id }: { id: string }) {
  return (
    <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5">
      <p className="font-display font-bold text-red-900">Remove this person</p>
      <p className="mt-1 text-sm text-red-800">
        They disappear from the About page immediately. This cannot be undone.
      </p>
      <form action={deleteTeamMember} className="mt-3">
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
        >
          Remove member
        </button>
      </form>
    </div>
  );
}
