"use client";

import { CalendarDays, X } from "lucide-react";
import { istDateKey, shiftDateKey } from "@/lib/format";
import type { DateRange } from "@/lib/ledger";
import { inputClass } from "@/components/ui/Field";

type PresetId = "all" | "today" | "7d" | "30d";

export function DateFilter({
  range,
  onChange,
}: {
  range: DateRange;
  onChange: (r: DateRange) => void;
}) {
  const todayKey = istDateKey(new Date());

  const presets: { id: PresetId; label: string; range: DateRange }[] = [
    { id: "all", label: "All time", range: { from: "", to: "" } },
    { id: "today", label: "Today", range: { from: todayKey, to: todayKey } },
    {
      id: "7d",
      label: "Last 7 days",
      range: { from: shiftDateKey(todayKey, -6), to: todayKey },
    },
    {
      id: "30d",
      label: "Last 30 days",
      range: { from: shiftDateKey(todayKey, -29), to: todayKey },
    },
  ];

  const activePreset = presets.find(
    (p) => p.range.from === range.from && p.range.to === range.to
  )?.id;
  const reversed = Boolean(range.from && range.to && range.from > range.to);
  const filtered = Boolean(range.from || range.to);

  return (
    <div className="space-y-3">
      <div
        role="radiogroup"
        aria-label="Quick date ranges"
        className="flex flex-wrap gap-2"
      >
        {presets.map((p) => {
          const active = activePreset === p.id;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(p.range)}
              className={`h-9 rounded-full border px-3.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron-500 ${
                active
                  ? "border-saffron-500 bg-saffron-500 text-white"
                  : "border-chai-200 bg-cream-50 text-chai-600 hover:bg-chai-50"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:max-w-md">
        <div>
          <label
            htmlFor="date-from"
            className="mb-1 flex items-center gap-1.5 text-xs font-medium text-charcoal-500"
          >
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            From
          </label>
          <input
            id="date-from"
            type="date"
            max={range.to || todayKey}
            value={range.from}
            onChange={(e) => onChange({ ...range, from: e.target.value })}
            className={inputClass(reversed ? "x" : undefined)}
          />
        </div>
        <div>
          <label
            htmlFor="date-to"
            className="mb-1 flex items-center gap-1.5 text-xs font-medium text-charcoal-500"
          >
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            To
          </label>
          <input
            id="date-to"
            type="date"
            min={range.from || undefined}
            max={todayKey}
            value={range.to}
            onChange={(e) => onChange({ ...range, to: e.target.value })}
            className={inputClass(reversed ? "x" : undefined)}
          />
        </div>
      </div>

      {reversed ? (
        <p className="text-sm text-rose-700">
          The start date is after the end date.
        </p>
      ) : null}

      {filtered ? (
        <button
          type="button"
          onClick={() => onChange({ from: "", to: "" })}
          className="inline-flex items-center gap-1 text-sm font-medium text-saffron-700 hover:underline"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          Clear date filter
        </button>
      ) : null}
    </div>
  );
}
