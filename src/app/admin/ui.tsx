import Link from "next/link";
import { cn } from "@/lib/utils";

/** Shared building blocks for the admin pages. Plain, dense, functional. */

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-950">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-ink-600">{description}</p>
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="rounded-lg bg-flame-500 px-4 py-2.5 text-sm font-display font-bold text-white transition-colors hover:bg-flame-600"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-ink-900/10 bg-white p-5 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-bold text-ink-950">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-500">{hint}</p> : null}
    </Card>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { href: string; label: string };
}) {
  return (
    <Card className="py-12 text-center">
      <p className="font-display text-lg font-bold text-ink-900">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-600">
        {description}
      </p>
      {action ? (
        <Link
          href={action.href}
          className="mt-5 inline-block rounded-lg bg-flame-500 px-4 py-2.5 text-sm font-display font-bold text-white transition-colors hover:bg-flame-600"
        >
          {action.label}
        </Link>
      ) : null}
    </Card>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  const tones = {
    neutral: "bg-ink-100 text-ink-700",
    success: "bg-success-50 text-success-700",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

/** Wraps a wide table so it scrolls inside its own box, not the page. */
export function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-ink-900/10 bg-white shadow-sm">
      {children}
    </div>
  );
}

export const tableClasses = {
  table: "w-full min-w-[44rem] border-collapse text-left text-sm",
  th: "border-b border-ink-900/10 px-4 py-3 font-display text-xs font-bold uppercase tracking-wider text-ink-600",
  td: "border-b border-ink-900/8 px-4 py-3 text-ink-800 align-top",
  tr: "last:[&>td]:border-b-0 hover:bg-sand-50/60",
};

// --- Form primitives -------------------------------------------------------

export function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  hint,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  required?: boolean;
  hint?: string;
  placeholder?: string;
}) {
  const id = `field-${name}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink-900">
        {label}
        {required ? <span className="text-flame-600"> *</span> : null}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="w-full rounded-lg border border-ink-900/15 bg-white px-3.5 py-2.5 text-ink-900 focus:border-flame-500 focus:outline-none focus:ring-2 focus:ring-flame-500/30"
      />
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-ink-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  rows = 4,
  hint,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  hint?: string;
  required?: boolean;
  placeholder?: string;
}) {
  const id = `field-${name}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink-900">
        {label}
        {required ? <span className="text-flame-600"> *</span> : null}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="w-full rounded-lg border border-ink-900/15 bg-white px-3.5 py-2.5 text-ink-900 focus:border-flame-500 focus:outline-none focus:ring-2 focus:ring-flame-500/30"
      />
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-ink-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Select({
  label,
  name,
  defaultValue,
  options,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: Array<{ value: string; label: string }>;
  hint?: string;
}) {
  const id = `field-${name}`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink-900">
        {label}
      </label>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="w-full rounded-lg border border-ink-900/15 bg-white px-3.5 py-2.5 text-ink-900 focus:border-flame-500 focus:outline-none focus:ring-2 focus:ring-flame-500/30"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-ink-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Checkbox({
  label,
  name,
  defaultChecked,
  hint,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  hint?: string;
}) {
  const id = `field-${name}`;
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="mt-0.5 size-4 rounded border-ink-900/25 text-flame-500 focus:ring-2 focus:ring-flame-500/30"
      />
      <div>
        <label htmlFor={id} className="text-sm font-semibold text-ink-900">
          {label}
        </label>
        {hint ? <p className="text-xs text-ink-500">{hint}</p> : null}
      </div>
    </div>
  );
}

export function SubmitRow({
  cancelHref,
  label = "Save changes",
}: {
  cancelHref: string;
  label?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-ink-900/10 pt-5">
      <button
        type="submit"
        className="rounded-lg bg-flame-500 px-5 py-2.5 font-display text-sm font-bold text-white transition-colors hover:bg-flame-600"
      >
        {label}
      </button>
      <Link
        href={cancelHref}
        className="rounded-lg border border-ink-900/15 px-5 py-2.5 text-sm font-semibold text-ink-800 transition-colors hover:bg-ink-50"
      >
        Cancel
      </Link>
    </div>
  );
}
