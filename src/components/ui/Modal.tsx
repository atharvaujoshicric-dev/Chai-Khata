"use client";

import { X } from "lucide-react";
import { useEffect, useId, type ReactNode } from "react";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  const width =
    size === "lg" ? "sm:max-w-2xl" : size === "sm" ? "sm:max-w-sm" : "sm:max-w-md";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 animate-fade-in bg-chai-900/55 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative flex max-h-[92dvh] w-full animate-slide-up flex-col rounded-t-3xl bg-cream-50 shadow-pop sm:rounded-2xl ${width}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-chai-100 px-5 pb-4 pt-5">
          <div>
            <h2
              id={titleId}
              className="font-display text-xl font-semibold text-chai-800"
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-charcoal-500">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1.5 -mt-1 rounded-lg p-2 text-charcoal-400 hover:bg-chai-50 hover:text-chai-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer ? (
          <div className="pb-safe flex flex-col-reverse gap-2 border-t border-chai-100 px-5 py-4 sm:flex-row sm:justify-end">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
