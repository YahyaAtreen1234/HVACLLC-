import { deleteService, saveService } from "../../actions";
import { FormShell } from "../../FormShell";
import {
  Card,
  Checkbox,
  Field,
  Select,
  SubmitRow,
  TextArea,
} from "../../ui";
import type { DbService } from "@/server/content/store";
import { ImageField } from "../../ImageField";

const ICONS = [
  "snowflake", "flame", "heat-pump", "wrench", "shield", "wind", "duct",
  "thermostat", "building", "clock", "check", "star", "alert",
];

const CATEGORIES = ["cooling", "heating", "air-quality", "maintenance", "commercial", "general"];

/**
 * Create/edit form for a service.
 *
 * List fields are plain textareas — one item per line — rather than a
 * repeater widget. It is the fastest thing to type into, and it survives
 * copy-paste from a document, which is how this content usually arrives.
 */
export function ServiceForm({ service }: { service?: DbService }) {
  const editing = Boolean(service);

  return (
    <FormShell action={saveService} className="space-y-6">
      {service ? <input type="hidden" name="id" value={service.id} /> : null}

      <Card className="space-y-5">
        <h2 className="font-display text-lg font-bold text-ink-950">Basics</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Service name"
            name="name"
            required
            defaultValue={service?.name}
            placeholder="AC Repair"
            hint="Short label used on cards and menus."
          />
          <Field
            label="URL slug"
            name="slug"
            defaultValue={service?.slug}
            placeholder="ac-repair"
            hint="Leave blank to generate from the name. Changing this breaks existing links."
          />
        </div>

        <Field
          label="Page title"
          name="description"
          defaultValue={service?.description}
          placeholder="Air Conditioning Repair"
          hint="The longer heading used on the service's own page."
        />

        <TextArea
          label="Summary"
          name="summary"
          required
          rows={2}
          defaultValue={service?.summary}
          hint="One or two sentences. Shown on the service card and in search results."
        />

        <div className="grid gap-5 sm:grid-cols-3">
          <Select
            label="Icon"
            name="icon"
            defaultValue={service?.icon}
            options={ICONS.map((value) => ({ value, label: value }))}
          />
          <Select
            label="Category"
            name="category"
            defaultValue={service?.category}
            options={CATEGORIES.map((value) => ({ value, label: value }))}
          />
          <Field
            label="Sort order"
            name="sortOrder"
            type="number"
            defaultValue={service?.sortOrder ?? 0}
            hint="Lower numbers first."
          />
        </div>
      </Card>

      <Card className="space-y-5">
        <h2 className="font-display text-lg font-bold text-ink-950">Page content</h2>

        <TextArea
          label="Body paragraphs"
          name="body"
          rows={8}
          defaultValue={service?.body.join("\n")}
          hint="One paragraph per line. Blank lines are ignored."
        />

        <TextArea
          label="What the visit covers"
          name="includes"
          rows={6}
          defaultValue={service?.includes.join("\n")}
          hint="One bullet per line."
        />

        <TextArea
          label="Signs you need this"
          name="signs"
          rows={6}
          defaultValue={service?.signs.join("\n")}
          hint="One bullet per line."
        />

        <Field
          label="Related services"
          name="related"
          defaultValue={service?.related.join(", ")}
          placeholder="ac-installation, maintenance"
          hint="Comma-separated slugs. These appear as 'often booked with this'."
        />
      </Card>

      <Card className="space-y-5">
        <h2 className="font-display text-lg font-bold text-ink-950">Photo</h2>

        <ImageField
          name="image"
          label="Photo"
          currentPath={service?.imageSrc}
          hint="Leave empty to show a labelled placeholder. JPEG, PNG, WebP or AVIF, up to 8 MB."
        />
        <Field
          label="Alt text"
          name="imageAlt"
          defaultValue={service?.imageAlt}
          hint="Describe what is happening in the photo, for screen readers and search engines."
        />
      </Card>

      <Card className="space-y-4">
        <h2 className="font-display text-lg font-bold text-ink-950">Visibility</h2>
        <Checkbox
          label="Published"
          name="published"
          defaultChecked={service?.published ?? true}
          hint="Unpublished services disappear from the site but are kept here."
        />
        <Checkbox
          label="Featured on the home page"
          name="featured"
          defaultChecked={service?.featured ?? false}
        />
      </Card>

      <SubmitRow
        cancelHref="/admin/services"
        label={editing ? "Save changes" : "Create service"}
      />
    </FormShell>
  );
}

/**
 * Rendered as a sibling of the edit form, never inside it — forms cannot nest,
 * and a delete button sharing a form with "save" is asking for an accident.
 */
export function DeleteServiceForm({ id }: { id: string }) {
  return (
    <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5">
      <p className="font-display font-bold text-red-900">Delete this service</p>
      <p className="mt-1 text-sm leading-relaxed text-red-800">
        Its page, cards and links are removed from the site immediately. This
        cannot be undone.
      </p>
      <form action={deleteService} className="mt-3">
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
        >
          Delete service
        </button>
      </form>
    </div>
  );
}
