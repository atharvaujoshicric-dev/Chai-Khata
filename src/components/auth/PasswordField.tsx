"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState, type InputHTMLAttributes } from "react";
import { inputClass } from "@/components/ui/Field";

export function PasswordField({
  label,
  error,
  hint,
  ...props
}: { label: string; error?: string; hint?: string } & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
>) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-charcoal-700"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={`${inputClass(error)} pr-12`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-1.5 my-1.5 flex w-9 items-center justify-center rounded-lg text-charcoal-400 hover:bg-chai-50 hover:text-chai-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron-500"
        >
          {visible ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
        </button>
      </div>
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
