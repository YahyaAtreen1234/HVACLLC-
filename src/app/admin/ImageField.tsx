"use client";

import { useId, useRef, useState } from "react";

/**
 * Photo picker for the admin forms.
 *
 * Replaces the old "type a file path" field, which quietly assumed whoever was
 * editing the site could copy files into a folder on the server. They cannot —
 * that is the whole point of having an admin panel.
 *
 * The chosen file rides along in the form's own submission (the parent form is
 * multipart), so there is no separate upload endpoint to secure and no
 * half-uploaded orphan file if the save is abandoned.
 *
 * `currentPath` is kept in a hidden input so that saving without touching the
 * photo preserves the existing one.
 */
export function ImageField({
  name,
  currentPath,
  label = "Photo",
  hint,
}: {
  /** Base field name, e.g. "image". Produces `image` (file) + `imageSrc`. */
  name: string;
  currentPath?: string;
  label?: string;
  hint?: string;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentPath || null);
  const [chosen, setChosen] = useState<string | null>(null);
  const [cleared, setCleared] = useState(false);

  function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setChosen(file.name);
    setCleared(false);
    // Object URL rather than a FileReader data URL: no base64 inflation, and
    // it is revoked as soon as it is replaced.
    setPreview((old) => {
      if (old?.startsWith("blob:")) URL.revokeObjectURL(old);
      return URL.createObjectURL(file);
    });
  }

  function onRemove() {
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    if (inputRef.current) inputRef.current.value = "";
    setPreview(null);
    setChosen(null);
    setCleared(true);
  }

  return (
    <div>
      <span className="block font-display text-sm font-semibold text-ink-950">
        {label}
      </span>

      <div className="mt-2 flex flex-wrap items-start gap-4">
        <div className="grid size-28 shrink-0 place-items-center overflow-hidden rounded-xl border border-ink-900/12 bg-sand-50">
          {preview ? (
            // Not next/image: this is either a blob: URL that only exists in
            // this tab, or an already-optimised upload. Nothing to optimise.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <span className="px-2 text-center text-xs text-ink-500">
              No photo yet
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <input
            ref={inputRef}
            id={id}
            type="file"
            name={name}
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={onPick}
            className="block w-full cursor-pointer rounded-lg border border-ink-900/12 bg-white text-sm text-ink-700 file:mr-3 file:cursor-pointer file:rounded-l-lg file:border-0 file:bg-ink-950 file:px-4 file:py-2.5 file:font-display file:text-sm file:font-semibold file:text-white hover:file:bg-ink-900"
          />

          <p className="mt-2 text-xs text-ink-600">
            {chosen
              ? `Selected: ${chosen} — it uploads when you save.`
              : (hint ?? "JPEG, PNG, WebP or AVIF. Up to 8 MB.")}
          </p>

          {preview && !chosen ? (
            <button
              type="button"
              onClick={onRemove}
              className="mt-2 font-display text-xs font-semibold text-flame-600 hover:text-flame-700"
            >
              Remove photo
            </button>
          ) : null}
        </div>
      </div>

      {/* Preserves the existing photo when the form is saved untouched, and
          signals an explicit removal when it is cleared. */}
      <input
        type="hidden"
        name={`${name}Src`}
        value={cleared ? "" : (currentPath ?? "")}
      />
    </div>
  );
}
