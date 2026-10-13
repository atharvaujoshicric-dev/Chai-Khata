import { ShoppingBag, Wallet } from "lucide-react";
import { Fragment } from "react";
import {
  dayLabel,
  formatDate,
  formatINR,
  formatTime,
  istDateKey,
} from "@/lib/format";
import { txDayKey } from "@/lib/ledger";
import type { Transaction } from "@/lib/types";

export function TransactionItem({
  tx,
  customerName,
  balanceAfter,
  showDate = false,
}: {
  tx: Transaction;
  /** Shown as the row title (owner views). Omit on the customer's own timeline. */
  customerName?: string;
  /** Running balance after this transaction (ledger view). */
  balanceAfter?: number;
  showDate?: boolean;
}) {
  const isPurchase = tx.type === "purchase";
  const itemCount = isPurchase
    ? tx.lines.reduce((n, l) => n + l.quantity, 0)
    : 0;

  const title =
    customerName ?? (isPurchase ? "Purchase" : "Payment received");
  const subtitle = isPurchase
    ? customerName
      ? `Purchase · ${itemCount} ${itemCount === 1 ? "item" : "items"}`
      : `${itemCount} ${itemCount === 1 ? "item" : "items"}`
    : customerName
      ? `Payment · ${tx.method}`
      : `Paid via ${tx.method}`;

  return (
    <div className="px-4 py-3.5 sm:px-5">
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
            isPurchase
              ? "bg-saffron-100 text-saffron-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {isPurchase ? (
            <ShoppingBag className="h-4.5 w-4.5" aria-hidden="true" />
          ) : (
            <Wallet className="h-4.5 w-4.5" aria-hidden="true" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-semibold text-charcoal-800">{title}</p>
              <p className="text-sm text-charcoal-400">{subtitle}</p>
            </div>
            <div className="shrink-0 text-right">
              <p
                className={`font-semibold tabular-nums ${
                  isPurchase ? "text-charcoal-800" : "text-emerald-700"
                }`}
              >
                {isPurchase ? "+" : "−"}
                {formatINR(isPurchase ? tx.total : tx.amount)}
              </p>
              <p className="text-xs text-charcoal-400">
                {showDate
                  ? `${formatDate(tx.createdAt)} · ${formatTime(tx.createdAt)}`
                  : formatTime(tx.createdAt)}
              </p>
            </div>
          </div>

          {isPurchase ? (
            <dl className="mt-2.5 space-y-1.5 rounded-xl bg-cream-100 px-3 py-2.5 text-sm">
              {tx.lines.map((l, i) => (
                <Fragment key={`${l.productId}-${i}`}>
                  <div className="flex items-baseline justify-between gap-3">
                    <dt className="min-w-0 text-charcoal-700">
                      <span className="font-medium">{l.name}</span>
                      <span className="ml-1.5 text-charcoal-400">
                        {l.quantity} × {formatINR(l.unitPrice)}
                      </span>
                    </dt>
                    <dd className="shrink-0 tabular-nums text-charcoal-700">
                      {formatINR(l.quantity * l.unitPrice)}
                    </dd>
                  </div>
                </Fragment>
              ))}
              {tx.lines.length > 1 ? (
                <div className="flex items-baseline justify-between gap-3 border-t border-chai-200/60 pt-1.5 font-semibold text-charcoal-800">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatINR(tx.total)}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}

          {tx.note ? (
            <p className="mt-2 text-sm italic text-charcoal-500">“{tx.note}”</p>
          ) : null}

          {balanceAfter !== undefined ? (
            <p className="mt-2 text-xs text-charcoal-400">
              Balance after:{" "}
              <span
                className={`font-semibold tabular-nums ${
                  balanceAfter > 0
                    ? "text-rose-700"
                    : balanceAfter < 0
                      ? "text-sky-700"
                      : "text-emerald-700"
                }`}
              >
                {balanceAfter < 0
                  ? `${formatINR(-balanceAfter)} advance`
                  : balanceAfter === 0
                    ? "Settled"
                    : `${formatINR(balanceAfter)} due`}
              </span>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Transactions grouped by IST day, newest first, with a per-day heading. */
export function TransactionTimeline({
  transactions,
  customerNames,
}: {
  transactions: Transaction[];
  /** When provided, each row shows the customer's name. */
  customerNames?: Map<string, string>;
}) {
  const todayKey = istDateKey(new Date());
  const groups: { key: string; items: Transaction[] }[] = [];
  for (const tx of transactions) {
    const key = txDayKey(tx);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(tx);
    else groups.push({ key, items: [tx] });
  }

  return (
    <div className="space-y-5">
      {groups.map((g) => {
        const spent = g.items.reduce(
          (s, t) => (t.type === "purchase" ? s + t.total : s),
          0
        );
        const paid = g.items.reduce(
          (s, t) => (t.type === "payment" ? s + t.amount : s),
          0
        );
        return (
          <section key={g.key} aria-label={dayLabel(g.key, todayKey)}>
            <div className="mb-2 flex items-baseline justify-between gap-3 px-1">
              <h3 className="text-sm font-semibold text-chai-700">
                {dayLabel(g.key, todayKey)}
                {g.key === todayKey || dayLabel(g.key, todayKey) === "Yesterday" ? (
                  <span className="ml-2 font-normal text-charcoal-400">
                    {formatDate(g.items[0].createdAt)}
                  </span>
                ) : null}
              </h3>
              <p className="text-xs text-charcoal-400">
                {spent > 0 ? `Charged ${formatINR(spent)}` : null}
                {spent > 0 && paid > 0 ? " · " : null}
                {paid > 0 ? `Paid ${formatINR(paid)}` : null}
              </p>
            </div>
            <div className="divide-y divide-chai-100 overflow-hidden rounded-2xl border border-chai-100 bg-cream-50 shadow-card">
              {g.items.map((tx) => (
                <TransactionItem
                  key={tx.id}
                  tx={tx}
                  customerName={customerNames?.get(tx.customerId)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
