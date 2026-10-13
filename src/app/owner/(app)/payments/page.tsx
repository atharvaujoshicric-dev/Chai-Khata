"use client";

import { CircleDollarSign, Inbox, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { matchesCustomer } from "@/components/CustomerPicker";
import { TransactionItem } from "@/components/TransactionItem";
import { PaymentModal } from "@/components/owner/PaymentModal";
import { Button, buttonClass } from "@/components/ui/Button";
import {
  Avatar,
  Card,
  EmptyState,
  PageHeader,
  SearchInput,
  StatCard,
} from "@/components/ui/Primitives";
import { useApp } from "@/context/store";
import {
  formatINR,
  formatMobile,
  istDateKey,
  round2,
  shiftDateKey,
} from "@/lib/format";
import { balancesByCustomer, txDayKey } from "@/lib/ledger";

export default function PaymentsPage() {
  const { customers, transactions } = useApp();
  const [query, setQuery] = useState("");
  const [payOpen, setPayOpen] = useState(false);
  const [payFor, setPayFor] = useState("");

  const balances = useMemo(() => balancesByCustomer(transactions), [transactions]);

  const owing = useMemo(
    () =>
      customers
        .map((c) => ({ customer: c, due: balances.get(c.id)?.outstanding ?? 0 }))
        .filter((x) => x.due > 0),
    [customers, balances]
  );
  const totalDue = round2(owing.reduce((s, x) => s + x.due, 0));

  const visibleOwing = useMemo(
    () =>
      owing
        .filter((x) => matchesCustomer(x.customer, query))
        .sort((a, b) => b.due - a.due),
    [owing, query]
  );

  const collectedWeek = useMemo(() => {
    const todayKey = istDateKey(new Date());
    const from = shiftDateKey(todayKey, -6);
    let sum = 0;
    for (const t of transactions) {
      if (t.type !== "payment") continue;
      const k = txDayKey(t);
      if (k >= from && k <= todayKey) sum += t.amount;
    }
    return round2(sum);
  }, [transactions]);

  const names = useMemo(
    () => new Map(customers.map((c) => [c.id, c.name])),
    [customers]
  );
  const recentPayments = useMemo(
    () => transactions.filter((t) => t.type === "payment").slice(0, 10),
    [transactions]
  );

  const open = (id = "") => {
    setPayFor(id);
    setPayOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Payments"
        subtitle="Collect money from customers and see who still owes."
        actions={
          <Button onClick={() => open()}>
            <Wallet className="h-4.5 w-4.5" aria-hidden="true" />
            Record payment
          </Button>
        }
      />

      <section aria-label="Dues summary" className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
        <div className="col-span-2 lg:col-span-1">
          <StatCard
            icon={CircleDollarSign}
            label="Total outstanding"
            value={formatINR(totalDue)}
            sub="Across all customers"
            tone="dark"
          />
        </div>
        <StatCard
          icon={Users}
          label="Customers with dues"
          value={String(owing.length)}
          sub={`of ${customers.length} customers`}
        />
        <StatCard
          icon={Wallet}
          label="Collected, 7 days"
          value={formatINR(collectedWeek)}
          sub="Payments received"
          tone="accent"
        />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="space-y-3 border-b border-chai-100 p-4 sm:p-5">
            <h2 className="font-display text-lg font-semibold text-chai-800">
              Outstanding balances
            </h2>
            <SearchInput
              placeholder="Search by name or mobile number"
              aria-label="Search outstanding balances"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {visibleOwing.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title={owing.length === 0 ? "No dues pending" : "No matches"}
              description={
                owing.length === 0
                  ? "Everyone is settled up."
                  : `No customer with dues matches “${query}”.`
              }
            />
          ) : (
            <ul className="divide-y divide-chai-100">
              {visibleOwing.map(({ customer, due }) => (
                <li key={customer.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                  <Avatar name={customer.name} />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/owner/customer/?id=${customer.id}`}
                      className="block truncate font-semibold text-charcoal-800 hover:text-saffron-700"
                    >
                      {customer.name}
                    </Link>
                    <p className="text-xs text-charcoal-400">
                      {formatMobile(customer.mobile)}
                    </p>
                  </div>
                  <p className="font-semibold tabular-nums text-rose-700">
                    {formatINR(due)}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => open(customer.id)}
                    aria-label={`Collect payment from ${customer.name}`}
                  >
                    Collect
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-chai-100 px-5 py-4">
            <h2 className="font-display text-lg font-semibold text-chai-800">
              Recent payments
            </h2>
          </div>
          {recentPayments.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No payments yet"
              description="Payments you record will show up here."
              action={
                <Link href="/owner/customers" className={buttonClass({ variant: "secondary" })}>
                  View customers
                </Link>
              }
            />
          ) : (
            <div className="divide-y divide-chai-100">
              {recentPayments.map((tx) => (
                <TransactionItem
                  key={tx.id}
                  tx={tx}
                  customerName={names.get(tx.customerId) ?? "Unknown customer"}
                  showDate
                />
              ))}
            </div>
          )}
        </Card>
      </div>

      <PaymentModal open={payOpen} onClose={() => setPayOpen(false)} customerId={payFor} />
    </>
  );
}
