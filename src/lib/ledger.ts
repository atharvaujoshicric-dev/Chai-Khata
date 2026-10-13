import { istDateKey, round2, shiftDateKey, weekdayShort } from "./format";
import type { PurchaseLine, Transaction } from "./types";

export interface Balance {
  purchases: number;
  payments: number;
  /** purchases - payments. Positive = customer owes. Negative = advance paid. */
  outstanding: number;
}

export function computeBalance(
  transactions: Transaction[],
  customerId: string
): Balance {
  let purchases = 0;
  let payments = 0;
  for (const t of transactions) {
    if (t.customerId !== customerId) continue;
    if (t.type === "purchase") purchases += t.total;
    else payments += t.amount;
  }
  purchases = round2(purchases);
  payments = round2(payments);
  return { purchases, payments, outstanding: round2(purchases - payments) };
}

export function balancesByCustomer(
  transactions: Transaction[]
): Map<string, Balance> {
  const map = new Map<string, Balance>();
  for (const t of transactions) {
    const b = map.get(t.customerId) ?? {
      purchases: 0,
      payments: 0,
      outstanding: 0,
    };
    if (t.type === "purchase") b.purchases += t.total;
    else b.payments += t.amount;
    map.set(t.customerId, b);
  }
  for (const b of map.values()) {
    b.purchases = round2(b.purchases);
    b.payments = round2(b.payments);
    b.outstanding = round2(b.purchases - b.payments);
  }
  return map;
}

export const EMPTY_BALANCE: Balance = {
  purchases: 0,
  payments: 0,
  outstanding: 0,
};

export function sortNewestFirst(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function txDayKey(t: Transaction): string {
  return istDateKey(new Date(t.createdAt));
}

export function linesTotal(lines: { quantity: number; unitPrice: number }[]) {
  return round2(lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0));
}

/** "2 × Masala Chai, 1 × Samosa" */
export function summarizeLines(lines: PurchaseLine[]): string {
  return lines.map((l) => `${l.quantity} × ${l.name}`).join(", ");
}

export interface RunningEntry {
  tx: Transaction;
  balanceAfter: number;
}

/** Transactions for one customer, newest first, each with the balance after it. */
export function withRunningBalance(
  transactions: Transaction[],
  customerId: string
): RunningEntry[] {
  const mine = transactions
    .filter((t) => t.customerId === customerId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  let running = 0;
  const out: RunningEntry[] = [];
  for (const tx of mine) {
    running = round2(running + (tx.type === "purchase" ? tx.total : -tx.amount));
    out.push({ tx, balanceAfter: running });
  }
  return out.reverse();
}

export interface DailySales {
  key: string;
  label: string;
  total: number;
}

export function lastNDaysSales(
  transactions: Transaction[],
  todayKey: string,
  days = 7
): DailySales[] {
  const keys: string[] = [];
  for (let i = days - 1; i >= 0; i--) keys.push(shiftDateKey(todayKey, -i));
  const totals = new Map<string, number>(keys.map((k) => [k, 0]));
  for (const t of transactions) {
    if (t.type !== "purchase") continue;
    const k = txDayKey(t);
    if (totals.has(k)) totals.set(k, (totals.get(k) ?? 0) + t.total);
  }
  return keys.map((key) => ({
    key,
    label: key === todayKey ? "Today" : weekdayShort(key),
    total: round2(totals.get(key) ?? 0),
  }));
}

export interface DateRange {
  from: string; // YYYY-MM-DD or ""
  to: string; // YYYY-MM-DD or ""
}

export function inRange(key: string, range: DateRange): boolean {
  if (range.from && key < range.from) return false;
  if (range.to && key > range.to) return false;
  return true;
}
