"use client";

import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Tone = "success" | "error" | "info";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone: Tone;
}

interface ToastApi {
  toast: (t: { title: string; description?: string; tone?: Tone }) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const toneStyles: Record<Tone, { icon: ReactNode; ring: string }> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
    ring: "border-emerald-200",
  },
  error: {
    icon: <AlertCircle className="h-5 w-5 text-rose-600" />,
    ring: "border-rose-200",
  },
  info: {
    icon: <Info className="h-5 w-5 text-saffron-600" />,
    ring: "border-saffron-200",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = (id: number) =>
    setItems((prev) => prev.filter((t) => t.id !== id));

  const api: ToastApi = {
    toast({ title, description, tone = "success" }) {
      const id = nextId.current++;
      setItems((prev) => [...prev.slice(-3), { id, title, description, tone }]);
      window.setTimeout(() => dismiss(id), 4000);
    },
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 p-3 pt-safe sm:items-end sm:p-5"
      >
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex w-full max-w-sm animate-slide-up items-start gap-3 rounded-xl border bg-cream-50 p-3.5 shadow-pop ${toneStyles[t.tone].ring}`}
          >
            <span className="mt-0.5">{toneStyles[t.tone].icon}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-charcoal-800">{t.title}</p>
              {t.description ? (
                <p className="mt-0.5 text-sm text-charcoal-500">{t.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="rounded p-1 text-charcoal-300 hover:text-charcoal-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
