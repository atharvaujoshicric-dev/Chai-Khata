"use client";

import {
  ArrowLeft,
  CircleDollarSign,
  Inbox,
  Pencil,
  Phone,
  Plus,
  ShoppingBag,
  Wallet,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { ChipGroup } from "@/components/ChipGroup";
import { DateFilter } from "@/components/DateFilter";
import { TransactionItem } from "@/components/TransactionItem";
import { CustomerFormModal } from "@/components/owner/CustomerFormModal";
import { PaymentModal } from "@/components/owner/PaymentModal";
import { Button, buttonClass } from "@/components/ui/Button";
import {
  Avatar,
  Badge,
  Card,
  EmptyState,
  StatCard,
} from "@/components/ui/Primitives";
import { useApp } from "@/context/store";
import {
  formatDate,
  formatDateKey,
  formatINR,
  formatMobile,
  formatTime,
} from "@/lib/format";
import {
  computeBalance,
  inRange,
  txDayKey,
  withRunningBalance,
  type DateRange,
} from "@/lib/ledger";

type TypeFilter = "all" | "purchase" | "payment";

export default function CustomerLedgerPage() {
  return (
    <Suspense fallback={null}>
      <CustomerLedger />
    </Suspense>
  );
}

function CustomerLedger() {
  const id = useSearchParams().get("id") ?? "";
  const { customers, transactions } = useApp();
  const customer = customers.find((c) => c.id === id);

  const [type, setType] = useState<TypeFilter>("all");
  const [range, setRange] = useState<DateRange>({ from: "", to: "" });
  const [editOpen, setEditOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  const balance = useMemo(
    () => computeBalance(transactions, id),
    [transactions, id]
  );
  const entries = useMemo(
    () => withRunningBalance(transactions, id),
    [transactions, id]
  );
  const visible = useMemo(
    () =>
      entries.filter(
        (e) =>
          (type === "all" || e.tx.type === type) &&
          inRange(txDayKey(e.tx), range)
      ),
    [entries, type, range]
  );

  if (!customer) {
    return (
      <Card>
        <EmptyState
          icon={UserX}
          title="Customer not found"
          description="This customer may have been removed, or the link is wrong."
          action={
            <Link href="/owner/customers" className={buttonClass()}>
              Back to customers
            </Link>
          }
        />
      </Card>
    );
  }

  const out = balance.outstanding;
  const filtered = type !== "all" || range.from || range.to;

  return (
    <>
      <Link
        href="/owner/customers"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-chai-600 hover:text-saffron-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All customers
      </Link>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={customer.name} size="lg" />
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold text-chai-800 sm:text-3xl">
              {customer.name}
            </h1>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-charcoal-500">
              <a
                href={`tel:+91${customer.mobile}`}
                className="inline-flex items-center gap-1.5 hover:text-saffron-700"
              >
                <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                {formatMobile(customer.mobile)}
              </a>
              {customer.locality ? <span>{customer.locality}</span> : null}
              <span>Customer since {formatDate(customer.joinedAt)}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/owner/purchases/new?customer=${customer.id}`}
            className={buttonClass()}
          >
            <Plus className="h-4.5 w-4.5" aria-hidden="true" />
            New purchase
          </Link>
          <Button variant="secondary" onClick={() => setPayOpen(true)}>
            <Wallet className="h-4.5 w-4.5" aria-hidden="true" />
            Record payment
          </Button>
          <Button variant="secondary" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4.5 w-4.5" aria-hidden="true" />
            Edit
          </Button>
        </div>
      </div>

      <section aria-label="Balance summary" className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
        <StatCard
          icon={ShoppingBag}
          label="Total purchases"
          value={formatINR(balance.purchases)}
        />
        <StatCard
          icon={Wallet}
          label="Total paid"
          value={formatINR(balance.payments)}
        />
        <div className="col-span-2 lg:col-span-1">
          <StatCard
            icon={CircleDollarSign}
            label={out < 0 ? "Advance paid" : "Outstanding"}
            value={formatINR(Math.abs(out))}
            sub={
              out > 0
                ? "Customer owes this amount"
                : out < 0
                  ? "Credit available for future purchases"
                  : "All settled"
            }
            tone={out > 0 ? "dark" : "accent"}
          />
        </div>
      </section>

      <Card className="mt-6">
        <div className="space-y-4 border-b border-chai-100 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold text-chai-800">
              Ledger
            </h2>
            <p className="text-sm text-charcoal-500">
              {filtered
                ? `${visible.length} of ${entries.length} transactions`
                : `${entries.length} transactions`}
            </p>
          </div>
          <ChipGroup<TypeFilter>
            label="Transaction type"
            value={type}
            onChange={setType}
            options={[
              { value: "all", label: "All" },
              { value: "purchase", label: "Purchases" },
              { value: "payment", label: "Payments" },
            ]}
          />
          <DateFilter range={range} onChange={setRange} />
        </div>

        {visible.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={entries.length === 0 ? "No transactions yet" : "Nothing in this view"}
            description={
              entries.length === 0
                ? "Purchases and payments will appear here."
                : "No transactions match the selected filters."
            }
            action={
              entries.length > 0 ? (
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
        ) : (
          <>
            {/* Desktop ledger table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-cream-100 text-xs uppercase tracking-wide text-charcoal-500">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold">Date &amp; time</th>
                    <th scope="col" className="px-3 py-3 font-semibold">Details</th>
                    <th scope="col" className="px-3 py-3 text-right font-semibold">Charged</th>
                    <th scope="col" className="px-3 py-3 text-right font-semibold">Paid</th>
                    <th scope="col" className="px-5 py-3 text-right font-semibold">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-chai-100">
                  {visible.map(({ tx, balanceAfter }) => (
                    <tr key={tx.id} className="align-top">
                      <td className="whitespace-nowrap px-5 py-3">
                        <p className="font-medium text-charcoal-800">
                          {formatDateKey(txDayKey(tx))}
                        </p>
                        <p className="text-xs text-charcoal-400">{formatTime(tx.createdAt)}</p>
                      </td>
                      <td className="px-3 py-3">
                        {tx.type === "purchase" ? (
                          <ul className="space-y-0.5">
                            {tx.lines.map((l, i) => (
                              <li key={`${l.productId}-${i}`} className="text-charcoal-700">
                                <span className="font-medium">{l.name}</span>{" "}
                                <span className="text-charcoal-400">
                                  {l.quantity} × {formatINR(l.unitPrice)} ={" "}
                                  {formatINR(l.quantity * l.unitPrice)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-charcoal-700">
                            <Badge tone="clear">Payment · {tx.method}</Badge>
                          </p>
                        )}
                        {tx.note ? (
                          <p className="mt-1 text-xs italic text-charcoal-500">“{tx.note}”</p>
                        ) : null}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-charcoal-800">
                        {tx.type === "purchase" ? formatINR(tx.total) : ""}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-emerald-700">
                        {tx.type === "payment" ? formatINR(tx.amount) : ""}
                      </td>
                      <td
                        className={`px-5 py-3 text-right font-semibold tabular-nums ${
                          balanceAfter > 0
                            ? "text-rose-700"
                            : balanceAfter < 0
                              ? "text-sky-700"
                              : "text-emerald-700"
                        }`}
                      >
                        {balanceAfter < 0
                          ? `${formatINR(-balanceAfter)} adv.`
                          : formatINR(balanceAfter)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="divide-y divide-chai-100 md:hidden">
              {visible.map(({ tx, balanceAfter }) => (
                <TransactionItem
                  key={tx.id}
                  tx={tx}
                  balanceAfter={balanceAfter}
                  showDate
                />
              ))}
            </div>
          </>
        )}
      </Card>

      <CustomerFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        customer={customer}
      />
      <PaymentModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        customerId={customer.id}
      />
    </>
  );
}
