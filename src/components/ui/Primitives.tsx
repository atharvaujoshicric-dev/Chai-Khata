import { Coffee, Search, type LucideIcon } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { initials } from "@/lib/format";

export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border border-chai-100 bg-cream-50 shadow-card ${className}`}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-semibold text-chai-800 sm:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-charcoal-500 sm:text-base">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = "default",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "accent" | "dark";
}) {
  const styles = {
    default: {
      wrap: "border-chai-100 bg-cream-50",
      icon: "bg-saffron-100 text-saffron-700",
      label: "text-charcoal-500",
      value: "text-chai-800",
      sub: "text-charcoal-400",
    },
    accent: {
      wrap: "border-saffron-200 bg-gradient-to-br from-saffron-100 to-saffron-50",
      icon: "bg-saffron-500 text-white",
      label: "text-saffron-700",
      value: "text-chai-900",
      sub: "text-saffron-700/80",
    },
    dark: {
      wrap: "border-chai-800 bg-chai-800",
      icon: "bg-saffron-500 text-chai-900",
      label: "text-chai-200",
      value: "text-cream-50",
      sub: "text-chai-200/80",
    },
  }[tone];

  return (
    <div className={`rounded-2xl border p-4 shadow-card sm:p-5 ${styles.wrap}`}>
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className={`text-sm font-medium ${styles.label}`}>{label}</p>
      </div>
      <p
        className={`mt-3 font-display text-2xl font-semibold tabular-nums sm:text-3xl ${styles.value}`}
      >
        {value}
      </p>
      {sub ? <p className={`mt-1 text-sm ${styles.sub}`}>{sub}</p> : null}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-chai-50 text-chai-300">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <h3 className="mt-4 font-display text-lg font-semibold text-chai-700">
        {title}
      </h3>
      {description ? (
        <p className="mt-1 max-w-xs text-sm text-charcoal-500">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "due" | "clear" | "advance" | "neutral" | "off";
  children: ReactNode;
}) {
  const styles = {
    due: "bg-rose-50 text-rose-700 ring-rose-200",
    clear: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    advance: "bg-sky-50 text-sky-700 ring-sky-200",
    neutral: "bg-chai-50 text-chai-600 ring-chai-100",
    off: "bg-charcoal-50 text-charcoal-500 ring-charcoal-100",
  }[tone];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${styles}`}
    >
      {children}
    </span>
  );
}

const AVATAR_COLORS = [
  "bg-saffron-100 text-saffron-700",
  "bg-chai-100 text-chai-600",
  "bg-emerald-100 text-emerald-800",
  "bg-sky-100 text-sky-800",
  "bg-rose-100 text-rose-800",
  "bg-amber-100 text-amber-800",
];

export function Avatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const dim =
    size === "lg"
      ? "h-16 w-16 text-xl"
      : size === "sm"
        ? "h-8 w-8 text-xs"
        : "h-10 w-10 text-sm";
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${dim} ${AVATAR_COLORS[hash % AVATAR_COLORS.length]}`}
    >
      {initials(name)}
    </span>
  );
}

export function SearchInput({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`relative ${className}`}>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-charcoal-300"
        aria-hidden="true"
      />
      <input
        type="search"
        className="w-full rounded-xl border border-chai-200 bg-white py-2.5 pl-10 pr-3.5 text-base text-charcoal-800 placeholder:text-charcoal-300 focus:border-saffron-500 focus:outline-none focus:ring-2 focus:ring-saffron-500/25 sm:text-[15px]"
        {...props}
      />
    </div>
  );
}

export function Logo({
  tone = "dark",
  subtitle = true,
}: {
  tone?: "dark" | "light";
  subtitle?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-saffron-400 to-saffron-600 text-white shadow-sm">
        <Coffee className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="leading-tight">
        <p
          className={`font-display text-lg font-semibold ${tone === "light" ? "text-cream-50" : "text-chai-800"}`}
        >
          Chai Khata
        </p>
        {subtitle ? (
          <p
            className={`text-xs ${tone === "light" ? "text-chai-200" : "text-charcoal-400"}`}
          >
            Digital tea-stall ledger
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function SimulatedNotice({ className = "" }: { className?: string }) {
  return (
    <p
      className={`rounded-xl border border-saffron-200 bg-saffron-50 px-3.5 py-2.5 text-sm text-saffron-700 ${className}`}
    >
      <strong className="font-semibold">Simulated authentication.</strong>{" "}
      This is a frontend demo. No real accounts, servers or databases are used,
      and data resets when you reload.
    </p>
  );
}
