"use client";

import { ArrowRight, Inbox, ShoppingBag, Wallet } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { TransactionItem } from "@/components/TransactionItem";
import { buttonClass } from "@/components/ui/Button";
import { Card, EmptyState } from "@/components/ui/Primitives";
import { useApp } from "@/context/store";
import { formatDate, formatINR } from "@/lib/format";
import { computeBalance } from "@/lib/ledger";

export default function CustomerHomePage() {
  const { currentCustomer, transactions } = useApp();
  const customerId = currentCustomer?.id ?? "";

  const mine = useMemo(
    () => transactions.filter((t) => t.customerId === customerId),
    [transactions, customerId]
  );
  const balance = useMemo(
    () => computeBalance(transactions, customerId),
    [transactions, customerId]
  );

  if (!currentCustomer) return null;
  const out = balance.outstanding;
  const firstName = currentCustomer.name.split(" ")[0];

  return (
    <>
      <div className="mb-5">
        <h1 className="font-display text-2xl font-semibold text-chai-800">
          Namaste, {firstName}
        </h1>
        <p className="text-sm text-charcoal-500">{formatDate(new Date())}</p>
      </div>

      <section
        aria-label="Your balance"
        className="relative overflow-hidden rounded-3xl bg-chai-800 p-5 text-cream-50 shadow-pop"
      >
        <div
          aria-hidden="true"
          className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-saffron-500/20 blur-2xl"
        />
        <p className="relative text-sm font-medium text-chai-200">
          {out < 0 ? "Advance balance" : "Outstanding balance"}
        </p>
        <p className="relative mt-1 font-display text-4xl font-semibold tabular-nums">
          {formatINR(Math.abs(out))}
        </p>
        <p className="relative mt-1 text-sm text-saffron-200">
          {out > 0
            ? "This is the amount you owe the stall."
            : out < 0
              ? "You have paid ahead. It will be used on future purchases."
              : "You are all settled up. Thank you!"}
        </p>

        <div className="relative mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/10 p-3.5">
            <p className="flex items-center gap-1.5 text-xs font-medium text-chai-200">
              <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
              Total purchases
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {formatINR(balance.purchases)}
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3.5">
            <p className="flex items-center gap-1.5 text-xs font-medium text-chai-200">
              <Wallet className="h-3.5 w-3.5" aria-hidden="true" />
              Total payments
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {formatINR(balance.payments)}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-7" aria-labelledby="recent-heading">
        <div className="mb-3 flex items-center justify-between">
          <h2
            id="recent-heading"
            className="font-display text-lg font-semibold text-chai-800"
          >
            Recent activity
          </h2>
          <Link
            href="/customer/history"
            className="inline-flex items-center gap-1 text-sm font-semibold text-saffron-700 hover:underline"
          >
            Full history
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <Card className="overflow-hidden">
          {mine.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="Nothing here yet"
              description="Your purchases and payments will show up here as the stall records them."
            />
          ) : (
            <div className="divide-y divide-chai-100">
              {mine.slice(0, 5).map((tx) => (
                <TransactionItem key={tx.id} tx={tx} showDate />
              ))}
            </div>
          )}
        </Card>

        {mine.length > 5 ? (
          <Link
            href="/customer/history"
            className={buttonClass({ variant: "secondary", full: true, className: "mt-4" })}
          >
            See all {mine.length} transactions
          </Link>
        ) : null}
        <p className="mt-4 text-center text-xs text-charcoal-400">
          Prices shown are what you were charged at the time of each purchase.
        </p>
      </section>
    </>
  );
}
