import { cn } from "@/lib/utils";

const CONTROL =
  "w-full rounded-lg border-2 bg-white px-4 py-3 text-base text-ink-950 transition-colors " +
  "placeholder:text-ink-400 focus:border-flame-500 focus:outline-none";

const NORMAL = "border-ink-900/12 hover:border-ink-900/25";
const INVALID = "border-danger-500 bg-danger-50/40";

interface FieldShellProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: (props: {
    id: string;
    "aria-invalid": boolean | undefined;
    "aria-describedby": string | undefined;
    className: string;
    required: boolean | undefined;
  }) => React.ReactNode;
}

/**
 * Label + control + hint + error, wired together with the ARIA attributes that
 * make a form usable with a screen reader:
 *   • the label is a real <label for>, so tapping it focuses the control
 *   • hints and errors are linked with aria-describedby
 *   • invalid controls get aria-invalid, and the error text is announced
 */
function FieldShell({
  id,
  label,
  error,
  hint,
  required,
  className,
  children,
}: FieldShellProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label
        htmlFor={id}
        className="font-display text-sm font-semibold text-ink-900"
      >
        {label}
        {required ? (
          <span className="ml-1 text-flame-600" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-2 text-xs font-normal text-ink-500">optional</span>
        )}
      </label>

      {hint ? (
        <p id={hintId} className="text-xs text-ink-600">
          {hint}
        </p>
      ) : null}

      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
        className: cn(CONTROL, error ? INVALID : NORMAL),
        required: required || undefined,
      })}

      {error ? (
        <p id={errorId} className="text-sm font-medium text-danger-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type BaseProps = Omit<FieldShellProps, "children">;

export function TextField({
  type = "text",
  autoComplete,
  placeholder,
  inputMode,
  defaultValue,
  maxLength,
  ...shell
}: BaseProps & {
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  placeholder?: string;
  inputMode?: "text" | "tel" | "email" | "numeric";
  defaultValue?: string;
  maxLength?: number;
}) {
  return (
    <FieldShell {...shell}>
      {(props) => (
        <input
          {...props}
          name={shell.id}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          inputMode={inputMode}
          defaultValue={defaultValue}
          maxLength={maxLength}
        />
      )}
    </FieldShell>
  );
}

export function SelectField({
  options,
  defaultValue,
  placeholder,
  ...shell
}: BaseProps & {
  options: Array<{ value: string; label: string }>;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <FieldShell {...shell}>
      {(props) => (
        <select {...props} name={shell.id} defaultValue={defaultValue ?? ""}>
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}

export function TextAreaField({
  rows = 5,
  placeholder,
  defaultValue,
  maxLength,
  ...shell
}: BaseProps & {
  rows?: number;
  placeholder?: string;
  defaultValue?: string;
  maxLength?: number;
}) {
  return (
    <FieldShell {...shell}>
      {(props) => (
        <textarea
          {...props}
          name={shell.id}
          rows={rows}
          placeholder={placeholder}
          defaultValue={defaultValue}
          maxLength={maxLength}
        />
      )}
    </FieldShell>
  );
}

/** Invisible to people, irresistible to bots. */
export function HoneypotField() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label htmlFor="company">Company (leave blank)</label>
      <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
