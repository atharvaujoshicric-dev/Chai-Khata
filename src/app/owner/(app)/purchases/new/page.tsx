"use client";

import {
  CheckCircle2,
  Minus,
  PackageSearch,
  Plus,
  ReceiptText,
  ShoppingCart,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { CustomerPicker } from "@/components/CustomerPicker";
import { CATEGORY_ICONS } from "@/components/owner/productIcons";
import { Button, buttonClass } from "@/components/ui/Button";
import { TextAreaField } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import {
  Card,
  EmptyState,
  PageHeader,
  SearchInput,
} from "@/components/ui/Primitives";
import { useApp } from "@/context/store";
import { formatINR, round2 } from "@/lib/format";
import { balancesByCustomer } from "@/lib/ledger";

const MAX_QTY = 99;

export default function NewPurchasePage() {
  return (
    <Suspense fallback={null}>
      <NewPurchase />
    </Suspense>
  );
}

function NewPurchase() {
  const search = useSearchParams();
  const { customers, products, transactions, addPurchase } = useApp();
  const { toast } = useToast();

  const preset = search.get("customer") ?? "";
  const [customerId, setCustomerId] = useState(
    customers.some((c) => c.id === preset) ? preset : ""
  );
  const [qty, setQty] = useState<Record<string, number>>({});
  const [note, setNote] = useState("");
  const [query, setQuery] = useState("");
  const [errors, setErrors] = useState<{ customer?: string; items?: string }>({});
  const [saved, setSaved] = useState<{
    customerId: string;
    name: string;
    total: number;
  } | null>(null);

  const balances = useMemo(() => balancesByCustomer(transactions), [transactions]);

  const available = useMemo(
    () => products.filter((p) => p.active).sort((a, b) => a.name.localeCompare(b.name)),
    [products]
  );
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? available.filter((p) => p.name.toLowerCase().includes(q)) : available;
  }, [available, query]);

  const lines = available
    .filter((p) => (qty[p.id] ?? 0) > 0)
    .map((p) => ({ product: p, quantity: qty[p.id] }));
  const total = round2(
    lines.reduce((s, l) => s + l.quantity * l.product.price, 0)
  );
  const itemCount = lines.reduce((n, l) => n + l.quantity, 0);

  const customer = customers.find((c) => c.id === customerId);
  const due = balances.get(customerId)?.outstanding ?? 0;
  const after = round2(due + total);

  const setQuantity = (id: string, next: number) => {
    setErrors((e) => ({ ...e, items: undefined }));
    setSaved(null);
    setQty((prev) => ({ ...prev, [id]: Math.min(MAX_QTY, Math.max(0, next)) }));
  };

  const submit = () => {
    const next: typeof errors = {};
    if (!customer) next.customer = "Select the customer for this bill.";
    if (lines.length === 0) next.items = "Add at least one item to the bill.";
    if (next.customer || next.items) {
      setErrors(next);
      return;
    }
    const res = addPurchase({
      customerId,
      items: lines.map((l) => ({
        productId: l.product.id,
        quantity: l.quantity,
      })),
      note,
    });
    if (!res.ok) {
      setErrors({ items: res.error });
      return;
    }
    toast({
      title: `${formatINR(res.transaction.total)} added to khata`,
      description: `${customer?.name} · ${itemCount} ${itemCount === 1 ? "item" : "items"}`,
    });
    setSaved({
      customerId,
      name: customer?.name ?? "",
      total: res.transaction.total,
    });
    setQty({});
    setNote("");
    setCustomerId("");
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <PageHeader
        title="New purchase"
        subtitle="Pick a customer, tap items, and add the bill to their khata."
      />

      {saved ? (
        <div
          role="status"
          className="mb-5 flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="flex items-start gap-2.5 text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <span>
              <strong className="font-semibold">{formatINR(saved.total)}</strong>{" "}
              added to {saved.name}&rsquo;s khata.
            </span>
          </p>
          <Link
            href={`/owner/customer/?id=${saved.customerId}`}
            className={buttonClass({ variant: "secondary", size: "sm" })}
          >
            View ledger
          </Link>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card className="p-4 sm:p-5">
            <CustomerPicker
              customers={customers}
              balances={balances}
              value={customerId}
              onChange={(id) => {
                setCustomerId(id);
                setSaved(null);
                setErrors((e) => ({ ...e, customer: undefined }));
              }}
              error={errors.customer}
            />
          </Card>

          <Card className="p-4 sm:p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display text-lg font-semibold text-chai-800">
                Items
              </h2>
              <SearchInput
                className="sm:w-64"
                placeholder="Search items"
                aria-label="Search items"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {available.length === 0 ? (
              <EmptyState
                icon={PackageSearch}
                title="No products available"
                description="Add products first, then you can bill them here."
                action={
                  <Link href="/owner/products" className={buttonClass()}>
                    Go to products
                  </Link>
                }
              />
            ) : shown.length === 0 ? (
              <EmptyState
                icon={PackageSearch}
                title="No items match"
                description={`Nothing found for “${query}”.`}
              />
            ) : (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {shown.map((p) => {
                  const Icon = CATEGORY_ICONS[p.category];
                  const q = qty[p.id] ?? 0;
                  return (
                    <li
                      key={p.id}
                      className={`rounded-xl border p-3 transition-colors ${
                        q > 0
                          ? "border-saffron-400 bg-saffron-50"
                          : "border-chai-100 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-saffron-100 text-saffron-700">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-charcoal-800">
                            {p.name}
                          </p>
                          <p className="text-sm tabular-nums text-charcoal-500">
                            {formatINR(p.price)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        {q === 0 ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            full
                            onClick={() => setQuantity(p.id, 1)}
                            aria-label={`Add ${p.name}`}
                          >
                            <Plus className="h-4 w-4" aria-hidden="true" />
                            Add
                          </Button>
                        ) : (
                          <div
                            className="flex items-center justify-between rounded-lg bg-white p-1 ring-1 ring-saffron-300"
                            role="group"
                            aria-label={`${p.name} quantity`}
                          >
                            <button
                              type="button"
                              onClick={() => setQuantity(p.id, q - 1)}
                              aria-label={`Remove one ${p.name}`}
                              className="flex h-9 w-11 items-center justify-center rounded-md text-saffron-700 hover:bg-saffron-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron-500"
                            >
                              <Minus className="h-4.5 w-4.5" aria-hidden="true" />
                            </button>
                            <span
                              className="min-w-8 text-center font-semibold tabular-nums"
                              aria-live="polite"
                            >
                              {q}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQuantity(p.id, q + 1)}
                              disabled={q >= MAX_QTY}
                              aria-label={`Add one more ${p.name}`}
                              className="flex h-9 w-11 items-center justify-center rounded-md text-saffron-700 hover:bg-saffron-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron-500 disabled:opacity-40"
                            >
                              <Plus className="h-4.5 w-4.5" aria-hidden="true" />
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        <aside id="bill" className="scroll-mt-20 lg:sticky lg:top-6 lg:self-start">
          <Card className="overflow-hidden">
            <div className="flex items-center gap-2 border-b border-chai-100 px-5 py-4">
              <ReceiptText className="h-5 w-5 text-saffron-600" aria-hidden="true" />
              <h2 className="font-display text-lg font-semibold text-chai-800">
                Current bill
              </h2>
            </div>

            {lines.length === 0 ? (
              <EmptyState
                icon={ShoppingCart}
                title="No items yet"
                description="Tap Add on an item to start the bill."
              />
            ) : (
              <ul className="divide-y divide-chai-100 px-5">
                {lines.map(({ product, quantity }) => (
                  <li key={product.id} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-charcoal-800">
                        {product.name}
                      </p>
                      <p className="text-sm tabular-nums text-charcoal-400">
                        {quantity} × {formatINR(product.price)}
                      </p>
                    </div>
                    <p className="font-semibold tabular-nums text-charcoal-800">
                      {formatINR(quantity * product.price)}
                    </p>
                    <button
                      type="button"
                      onClick={() => setQuantity(product.id, 0)}
                      aria-label={`Remove ${product.name} from bill`}
                      className="rounded-md p-1.5 text-charcoal-300 hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="space-y-4 border-t border-chai-100 p-5">
              {errors.items ? (
                <p className="text-sm text-rose-700">{errors.items}</p>
              ) : null}

              <TextAreaField
                label="Note (optional)"
                rows={2}
                placeholder="e.g. Office order, 3 PM"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />

              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between text-charcoal-600">
                  <dt>Items</dt>
                  <dd className="tabular-nums">{itemCount}</dd>
                </div>
                {customer ? (
                  <div className="flex justify-between text-charcoal-600">
                    <dt>{customer.name.split(" ")[0]}&rsquo;s balance now</dt>
                    <dd className="tabular-nums">
                      {due < 0 ? `${formatINR(-due)} advance` : formatINR(due)}
                    </dd>
                  </div>
                ) : null}
                <div className="flex items-baseline justify-between border-t border-chai-100 pt-2 text-base font-semibold text-charcoal-800">
                  <dt>Bill total</dt>
                  <dd className="font-display text-2xl tabular-nums">
                    {formatINR(total)}
                  </dd>
                </div>
                {customer && total > 0 ? (
                  <div className="flex justify-between text-charcoal-600">
                    <dt>Balance after this bill</dt>
                    <dd className="font-semibold tabular-nums text-rose-700">
                      {after < 0 ? `${formatINR(-after)} advance` : formatINR(after)}
                    </dd>
                  </div>
                ) : null}
              </dl>

              <Button size="lg" full onClick={submit} disabled={lines.length === 0}>
                Add to khata{total > 0 ? ` · ${formatINR(total)}` : ""}
              </Button>
            </div>
          </Card>
        </aside>
      </div>

      {lines.length > 0 ? (
        <a
          href="#bill"
          className="fixed inset-x-4 bottom-24 z-20 flex items-center justify-between rounded-2xl bg-chai-800 px-5 py-3.5 text-cream-50 shadow-pop md:hidden"
        >
          <span className="flex items-center gap-2 font-semibold">
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            View bill · {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
          <span className="font-display text-lg font-semibold tabular-nums">
            {formatINR(total)}
          </span>
        </a>
      ) : null}
    </>
  );
}
