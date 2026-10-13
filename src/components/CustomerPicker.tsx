"use client";

import { Check, Search, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/Primitives";
import { formatINR, formatMobile } from "@/lib/format";
import type { Balance } from "@/lib/ledger";
import type { Customer } from "@/lib/types";
import { normalizeMobile } from "@/lib/validation";

export function matchesCustomer(c: Customer, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (c.name.toLowerCase().includes(q)) return true;
  const digits = normalizeMobile(q) || q.replace(/\D/g, "");
  return digits.length > 0 && c.mobile.includes(digits);
}

function DueText({ outstanding }: { outstanding: number }) {
  if (outstanding > 0)
    return (
      <span className="font-semibold tabular-nums text-rose-700">
        {formatINR(outstanding)} due
      </span>
    );
  if (outstanding < 0)
    return (
      <span className="font-semibold tabular-nums text-sky-700">
        {formatINR(-outstanding)} advance
      </span>
    );
  return <span className="font-semibold text-emerald-700">Settled</span>;
}

export function CustomerPicker({
  customers,
  balances,
  value,
  onChange,
  error,
  label = "Customer",
}: {
  customers: Customer[];
  balances: Map<string, Balance>;
  value: string;
  onChange: (id: string) => void;
  error?: string;
  label?: string;
}) {
  const [query, setQuery] = useState("");
  const selected = customers.find((c) => c.id === value);

  const results = useMemo(
    () => customers.filter((c) => matchesCustomer(c, query)).slice(0, 30),
    [customers, query]
  );

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-charcoal-700">{label}</p>

      {selected ? (
        <div className="flex items-center gap-3 rounded-xl border border-saffron-300 bg-saffron-50 p-3">
          <Avatar name={selected.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-charcoal-800">
              {selected.name}
            </p>
            <p className="text-sm text-charcoal-500">
              {formatMobile(selected.mobile)} ·{" "}
              <DueText outstanding={balances.get(selected.id)?.outstanding ?? 0} />
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange("");
              setQuery("");
            }}
            className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-saffron-700 hover:bg-saffron-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron-500"
          >
            Change
          </button>
        </div>
      ) : (
        <div
          className={`rounded-xl border bg-white ${error ? "border-rose-400" : "border-chai-200"}`}
        >
          <div className="relative border-b border-chai-100">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-charcoal-300"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or mobile number"
              aria-label="Search customers"
              className="w-full rounded-t-xl bg-transparent py-3 pl-10 pr-3.5 text-base placeholder:text-charcoal-300 focus:outline-none sm:text-[15px]"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto p-1.5" role="listbox" aria-label="Customers">
            {results.length === 0 ? (
              <li className="flex items-center gap-2 px-3 py-4 text-sm text-charcoal-400">
                <UserRound className="h-4 w-4" aria-hidden="true" />
                No customer matches “{query}”.
              </li>
            ) : (
              results.map((c) => (
                <li key={c.id} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onClick={() => onChange(c.id)}
                    className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-chai-50 focus:bg-chai-50 focus:outline-none"
                  >
                    <Avatar name={c.name} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-charcoal-800">
                        {c.name}
                      </span>
                      <span className="block text-xs text-charcoal-400">
                        {formatMobile(c.mobile)}
                      </span>
                    </span>
                    <span className="text-xs">
                      <DueText outstanding={balances.get(c.id)?.outstanding ?? 0} />
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {error ? <p className="mt-1.5 text-sm text-rose-700">{error}</p> : null}
      {selected ? (
        <p className="sr-only">
          <Check /> Customer selected
        </p>
      ) : null}
    </div>
  );
}
