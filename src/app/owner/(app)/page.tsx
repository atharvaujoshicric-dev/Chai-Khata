"use client";

import {
  IndianRupee,
  Plus,
  ReceiptText,
  Users,
  UserPlus,
  Wallet,
  CircleDollarSign,
  Inbox,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { TransactionItem } from "@/components/TransactionItem";
import { CustomerFormModal } from "@/components/owner/CustomerFormModal";
import { PaymentModal } from "@/components/owner/PaymentModal";
import { SalesChart } from "@/components/owner/SalesChart";
import { Button, buttonClass } from "@/components/ui/Button";
import {
  Avatar,
  Card,
  EmptyState,
  PageHeader,
  StatCard,
} from "@/components/ui/Primitives";
import { useApp } from "@/context/store";
import {
  formatDate,
  formatINR,
  istDateKey,
  istMinutesOfDay,
  round2,
} from "@/lib/format";
import { balancesByCustomer, lastNDaysSales, txDayKey } from "@/lib/ledger";

function greeting(): string {
  const h = istMinutesOfDay(new Date()) / 60;
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function OwnerDashboardPage() {
  const { customers, transactions } = useApp();
  const [addOpen, setAddOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [payFor, setPayFor] = useState("");

  const data = useMemo(() => {
    const todayKey = istDateKey(new Date());
    const balances = balancesByCustomer(transactions);

    let todaySales = 0;
    let todayCount = 0;
    let collectedToday = 0;
    for (const t of transactions) {
      if (txDayKey(t) !== todayKey) continue;
      if (t.type === "purchase") {
        todaySales += t.total;
        todayCount += 1;
      } else {
        collectedToday += t.amount;
      }
    }

    let totalDues = 0;
    let withDues = 0;
    for (const c of customers) {
      const out = balances.get(c.id)?.outstanding ?? 0;
      if (out > 0) {
        totalDues += out;
        withDues += 1;
      }
    }

    const topDues = customers
      .map((c) => ({ customer: c, due: balances.get(c.id)?.outstanding ?? 0 }))
      .filter((x) => x.due > 0)
      .sort((a, b) => b.due - a.due)
      .slice(0, 5);

    const week = lastNDaysSales(transactions, todayKey, 7);
    return {
      balances,
      todaySales: round2(todaySales),
      todayCount,
      collectedToday: round2(collectedToday),
      totalDues: round2(totalDues),
      withDues,
      topDues,
      week,
      weekTotal: round2(week.reduce((s, d) => s + d.total, 0)),
    };
  }, [customers, transactions]);

  const names = useMemo(
    () => new Map(customers.map((c) => [c.id, c.name])),
    [customers]
  );
  const recent = transactions.slice(0, 8);

  const openPayment = (customerId = "") => {
    setPayFor(customerId);
    setPayOpen(true);
  };

  return (
    <>
      <PageHeader
        title={`${greeting()}, Owner`}
        subtitle={`${formatDate(new Date())} · here is how the stall is doing today`}
        actions={
          <>
            <Link href="/owner/purchases/new" className={buttonClass()}>
              <Plus className="h-4.5 w-4.5" aria-hidden="true" />
              New purchase
            </Link>
            <Button variant="secondary" onClick={() => openPayment()}>
              <Wallet className="h-4.5 w-4.5" aria-hidden="true" />
              Record payment
            </Button>
            <Button variant="secondary" onClick={() => setAddOpen(true)}>
              <UserPlus className="h-4.5 w-4.5" aria-hidden="true" />
              Add customer
            </Button>
          </>
        }
      />

      <section aria-label="Key figures" className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard
          icon={IndianRupee}
          label="Today's sales"
          value={formatINR(data.todaySales)}
          sub={`${data.todayCount} ${data.todayCount === 1 ? "purchase" : "purchases"}`}
          tone="accent"
        />
        <StatCard
          icon={Users}
          label="Total customers"
          value={String(customers.length)}
          sub={`${data.withDues} with dues`}
        />
        <StatCard
          icon={CircleDollarSign}
          label="Outstanding dues"
          value={formatINR(data.totalDues)}
          sub="To collect from customers"
          tone="dark"
        />
        <StatCard
          icon={Wallet}
          label="Collected today"
          value={formatINR(data.collectedToday)}
          sub="Payments received"
        />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="font-display text-lg font-semibold text-chai-800">
              Sales, last 7 days
            </h2>
            <p className="text-sm text-charcoal-500">
              {formatINR(data.weekTotal)} this week
            </p>
          </div>
          <SalesChart data={data.week} />
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-chai-100 px-5 py-4">
            <h2 className="font-display text-lg font-semibold text-chai-800">
              Highest dues
            </h2>
            <Link
              href="/owner/payments"
              className="text-sm font-semibold text-saffron-700 hover:underline"
            >
              View all
            </Link>
          </div>
          {data.topDues.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="No dues pending"
              description="Everyone is settled up. Nice work!"
            />
          ) : (
            <ul className="divide-y divide-chai-100">
              {data.topDues.map(({ customer, due }) => (
                <li
                  key={customer.id}
                  className="flex items-center gap-3 px-5 py-3"
                >
                  <Avatar name={customer.name} />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/owner/customer/?id=${customer.id}`}
                      className="block truncate font-semibold text-charcoal-800 hover:text-saffron-700"
                    >
                      {customer.name}
                    </Link>
                    <p className="text-sm font-semibold tabular-nums text-rose-700">
                      {formatINR(due)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => openPayment(customer.id)}
                    aria-label={`Collect payment from ${customer.name}`}
                  >
                    Collect
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-chai-100 px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-chai-800">
            Recent transactions
          </h2>
          <Link
            href="/owner/transactions"
            className="text-sm font-semibold text-saffron-700 hover:underline"
          >
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No transactions yet"
            description="Record the first purchase to start the khata."
            action={
              <Link href="/owner/purchases/new" className={buttonClass()}>
                <ReceiptText className="h-4.5 w-4.5" aria-hidden="true" />
                New purchase
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-chai-100">
            {recent.map((tx) => (
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

      <CustomerFormModal open={addOpen} onClose={() => setAddOpen(false)} />
      <PaymentModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        customerId={payFor}
      />
    </>
  );
}
