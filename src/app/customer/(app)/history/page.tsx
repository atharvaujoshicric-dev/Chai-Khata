"use client";

import { Inbox } from "lucide-react";
import { useMemo, useState } from "react";
import { ChipGroup } from "@/components/ChipGroup";
import { DateFilter } from "@/components/DateFilter";
import { TransactionTimeline } from "@/components/TransactionItem";
import { Button } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/Primitives";
import { useApp } from "@/context/store";
import { formatINR, round2 } from "@/lib/format";
import { inRange, txDayKey, type DateRange } from "@/lib/ledger";

type TypeFilter = "all" | "purchase" | "payment";
const PAGE = 30;

export default function CustomerHistoryPage() {
  const { currentCustomer, transactions } = useApp();
  const customerId = currentCustomer?.id ?? "";
  const [type, setType] = useState<TypeFilter>("all");
  const [range, setRange] = useState<DateRange>({ from: "", to: "" });
  const [limit, setLimit] = useState(PAGE);

  const mine = useMemo(
    () => transactions.filter((t) => t.customerId === customerId),
    [transactions, customerId]
  );
  const filtered = useMemo(
    () =>
      mine.filter(
        (t) =>
          (type === "all" || t.type === type) && inRange(txDayKey(t), range)
      ),
    [mine, type, range]
  );
  const totals = useMemo(() => {
    let charged = 0;
    let paid = 0;
    for (const t of filtered) {
      if (t.type === "purchase") charged += t.total;
      else paid += t.amount;
    }
    return { charged: round2(charged), paid: round2(paid) };
  }, [filtered]);

  if (!currentCustomer) return null;

  const hasFilters = type !== "all" || Boolean(range.from || range.to);

  return (
    <>
      <h1 className="mb-1 font-display text-2xl font-semibold text-chai-800">
        History
      </h1>
      <p className="mb-5 text-sm text-charcoal-500">
        Every item, price and payment on your khata.
      </p>

      <Card className="mb-5 space-y-4 p-4">
        <ChipGroup<TypeFilter>
          label="Transaction type"
          value={type}
          onChange={(v) => {
            setType(v);
            setLimit(PAGE);
          }}
          options={[
            { value: "all", label: "All" },
            { value: "purchase", label: "Purchases" },
            { value: "payment", label: "Payments" },
          ]}
        />
        <DateFilter
          range={range}
          onChange={(r) => {
            setRange(r);
            setLimit(PAGE);
          }}
        />
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-chai-100 bg-cream-50 p-3.5">
          <p className="text-xs font-medium text-charcoal-500">
            {hasFilters ? "Charged in view" : "Total charged"}
          </p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums text-charcoal-800">
            {formatINR(totals.charged)}
          </p>
        </div>
        <div className="rounded-2xl border border-chai-100 bg-cream-50 p-3.5">
          <p className="text-xs font-medium text-charcoal-500">
            {hasFilters ? "Paid in view" : "Total paid"}
          </p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums text-emerald-700">
            {formatINR(totals.paid)}
          </p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Inbox}
            title={mine.length === 0 ? "No transactions yet" : "Nothing in this view"}
            description={
              mine.length === 0
                ? "Your purchases and payments will appear here."
                : "No transactions match the selected dates or type."
            }
            action={
              hasFilters ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setType("all");
                    setRange({ from: "", to: "" });
                  }}
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <>
          <TransactionTimeline transactions={filtered.slice(0, limit)} />
          {filtered.length > limit ? (
            <div className="mt-6 flex justify-center">
              <Button variant="secondary" onClick={() => setLimit((l) => l + PAGE)}>
                Show more ({filtered.length - limit} remaining)
              </Button>
            </div>
          ) : null}
        </>
      )}
    </>
  );
}
