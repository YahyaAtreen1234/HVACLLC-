import { deleteArea, saveArea } from "../../actions";
import { Card, Checkbox, Field, SubmitRow, TextArea } from "../../ui";
import type { DbServiceArea } from "@/server/content/store";

export function AreaForm({ area }: { area?: DbServiceArea }) {
  const editing = Boolean(area);

  return (
    <form action={saveArea} className="space-y-6">
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
          label="Note"
          name="note"
          rows={2}
          defaultValue={area?.note}
          hint="Optional. E.g. a travel surcharge or limited coverage."
        />

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
    </form>
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
