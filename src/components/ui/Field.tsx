import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

const base =
  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-base text-charcoal-800 placeholder:text-charcoal-300 transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-cream-100 disabled:text-charcoal-400 sm:text-[15px]";
const ok = "border-chai-200 focus:border-saffron-500 focus:ring-saffron-500/25";
const bad = "border-rose-400 focus:border-rose-500 focus:ring-rose-400/25";

export const inputClass = (error?: string) => `${base} ${error ? bad : ok}`;

function FieldShell({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-charcoal-700"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-rose-700">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-charcoal-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type CommonProps = { label: string; hint?: string; error?: string };

export function TextField({
  label,
  hint,
  error,
  className = "",
  prefix,
  ...props
}: CommonProps & InputHTMLAttributes<HTMLInputElement> & { prefix?: string }) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <div className="relative">
        {prefix ? (
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-charcoal-400">
            {prefix}
          </span>
        ) : null}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${inputClass(error)} ${prefix ? "pl-8" : ""} ${className}`}
          {...props}
        />
      </div>
    </FieldShell>
  );
}

export function SelectField({
  label,
  hint,
  error,
  className = "",
  children,
  ...props
}: CommonProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        className={`${inputClass(error)} ${className}`}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
}

export function TextAreaField({
  label,
  hint,
  error,
  className = "",
  ...props
}: CommonProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        className={`${inputClass(error)} min-h-[84px] resize-y ${className}`}
        {...props}
      />
    </FieldShell>
  );
}
