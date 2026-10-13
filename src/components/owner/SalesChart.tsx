import { formatINR } from "@/lib/format";
import type { DailySales } from "@/lib/ledger";

function compact(v: number): string {
  if (v >= 1000) return `₹${(v / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `₹${Math.round(v)}`;
}

export function SalesChart({ data }: { data: DailySales[] }) {
  const max = Math.max(...data.map((d) => d.total), 1);
  return (
    <ul className="flex h-48 items-end gap-2 sm:gap-3" aria-label="Sales for the last 7 days">
      {data.map((d, i) => {
        const isToday = i === data.length - 1;
        const pct = Math.max((d.total / max) * 100, d.total > 0 ? 4 : 1.5);
        return (
          <li
            key={d.key}
            className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
            aria-label={`${d.label}: ${formatINR(d.total)}`}
          >
            <span className="text-[11px] font-medium tabular-nums text-charcoal-500">
              {d.total > 0 ? compact(d.total) : "–"}
            </span>
            <div className="flex w-full flex-1 items-end">
              <div
                className={`w-full rounded-t-lg ${
                  isToday
                    ? "bg-gradient-to-t from-saffron-600 to-saffron-400"
                    : "bg-chai-200"
                }`}
                style={{ height: `${pct}%` }}
              />
            </div>
            <span
              className={`text-xs ${isToday ? "font-semibold text-saffron-700" : "text-charcoal-400"}`}
            >
              {d.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
