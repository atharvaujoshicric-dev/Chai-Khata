"use client";

import { Inbox } from "lucide-react";
import { useMemo, useState } from "react";
import { ChipGroup } from "@/components/ChipGroup";
import { matchesCustomer } from "@/components/CustomerPicker";
import { DateFilter } from "@/components/DateFilter";
import { TransactionTimeline } from "@/components/TransactionItem";
import { Button } from "@/components/ui/Button";
import {
  Card,
  EmptyState,
  PageHeader,
  SearchInput,
} from "@/components/ui/Primitives";
import { useApp } from "@/context/store";
import { formatINR, round2 } from "@/lib/format";
import { inRange, txDayKey, type DateRange } from "@/lib/ledger";

type TypeFilter = "all" | "purchase" | "payment";
const PAGE = 40;

export default function TransactionsPage() {
  const { customers, transactions } = useApp();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [range, setRange] = useState<DateRange>({ from: "", to: "" });
  const [limit, setLimit] = useState(PAGE);

  const names = useMemo(
    () => new Map(customers.map((c) => [c.id, c.name])),
    [customers]
  );

  const filtered = useMemo(() => {
    const ids = query.trim()
      ? new Set(customers.filter((c) => matchesCustomer(c, query)).map((c) => c.id))
      : null;
    return transactions.filter(
      (t) =>
        (!ids || ids.has(t.customerId)) &&
        (type === "all" || t.type === type) &&
        inRange(txDayKey(t), range)
    );
  }, [customers, transactions, query, type, range]);

  const totals = useMemo(() => {
    let charged = 0;
    let paid = 0;
    for (const t of filtered) {
      if (t.type === "purchase") charged += t.total;
      else paid += t.amount;
    }
    return { charged: round2(charged), paid: round2(paid) };
  }, [filtered]);

  const hasFilters = Boolean(query || type !== "all" || range.from || range.to);
  const reset = () => {
    setQuery("");
    setType("all");
    setRange({ from: "", to: "" });
    setLimit(PAGE);
  };

  return (
    <>
      <PageHeader
        title="Transactions"
        subtitle="Every purchase and payment across all customers."
      />

      <Card className="mb-6 space-y-4 p-4 sm:p-5">
        <SearchInput
          placeholder="Search by customer name or mobile number"
          aria-label="Search transactions by customer"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setLimit(PAGE);
          }}
        />
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

      <p className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-charcoal-500">
        <span>
          <strong className="font-semibold text-charcoal-800">{filtered.length}</strong>{" "}
          {filtered.length === 1 ? "transaction" : "transactions"}
        </span>
        <span>
          Charged{" "}
          <strong className="font-semibold tabular-nums text-charcoal-800">
            {formatINR(totals.charged)}
          </strong>
        </span>
        <span>
          Paid{" "}
          <strong className="font-semibold tabular-nums text-emerald-700">
            {formatINR(totals.paid)}
          </strong>
        </span>
      </p>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Inbox}
            title="No transactions found"
            description={
              hasFilters
                ? "Nothing matches your search and filters."
                : "Purchases and payments will appear here."
            }
            action={
              hasFilters ? (
                <Button variant="secondary" onClick={reset}>
                  Clear search and filters
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <>
          <TransactionTimeline
            transactions={filtered.slice(0, limit)}
            customerNames={names}
          />
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
