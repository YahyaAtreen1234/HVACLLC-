import { deleteArea, saveArea } from "../../actions";
import { FormShell } from "../../FormShell";
import { Card, Checkbox, Field, SubmitRow, TextArea } from "../../ui";
import type { DbServiceArea } from "@/server/content/store";

export function AreaForm({ area }: { area?: DbServiceArea }) {
  const editing = Boolean(area);

  return (
    <FormShell action={saveArea} className="space-y-6">
      {area ? <input type="hidden" name="id" value={area.id} /> : null}

      <Card className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field
            label="City"
            name="city"
            required
            defaultValue={area?.city}
            placeholder="Springfield"
          />
          <Field
            label="State"
            name="state"
            required
            defaultValue={area?.state}
            placeholder="OH"
            hint="Two-letter code."
          />
          <Field
            label="URL slug"
            name="slug"
            defaultValue={area?.slug}
            hint="Leave blank to generate."
          />
        </div>

        <Field
          label="Neighbourhoods"
          name="neighborhoods"
          defaultValue={area?.neighborhoods.join(", ")}
          placeholder="Downtown, North Side, Riverside"
          hint="Comma-separated. Helps you show up in searches for specific areas."
        />

        <TextArea
          label="What makes this town different"
          name="note"
          rows={4}
          defaultValue={area?.note}
          hint="Shown at the top of this town's page, and the only part of it that is not shared with every other town. Write two or three sentences a local would recognise: the age of the housing, a common fault you see here, an estate or district you work in often, how long the drive is. Without this, the page is the same text as every other city with the name swapped — which search engines treat as a doorway page and may penalise."
        />

        {!area?.note?.trim() ? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
            <strong className="font-display font-bold">
              No local writing yet
            </strong>
            <p className="mt-1">
              This page currently differs from the other town pages only by the
              name appearing in it. Fill in the field above before removing the
              tick below, or the page goes live as one of eight near-identical
              copies.
            </p>
          </div>
        ) : null}

        <Checkbox
          label="Still unconfirmed — keep out of search results"
          name="isPlaceholder"
          defaultChecked={area?.isPlaceholder ?? true}
          hint="Tick this until you are certain the office dispatches to this town. While ticked, the city page is set to noindex and stays out of the sitemap, so you never rank for a place you cannot actually drive to."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Checkbox
            label="Published"
            name="published"
            defaultChecked={area?.published ?? true}
          />
          <Field
            label="Sort order"
            name="sortOrder"
            type="number"
            defaultValue={area?.sortOrder ?? 0}
          />
        </div>
      </Card>

      <SubmitRow
        cancelHref="/admin/areas"
        label={editing ? "Save changes" : "Add area"}
      />
    </FormShell>
  );
}

export function DeleteAreaForm({ id }: { id: string }) {
  return (
    <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5">
      <p className="font-display font-bold text-red-900">Delete this area</p>
      <form action={deleteArea} className="mt-3">
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
        >
          Delete area
        </button>
      </form>
    </div>
  );
}
