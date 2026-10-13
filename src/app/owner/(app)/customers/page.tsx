"use client";

import { Pencil, UserPlus, UserSearch, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ChipGroup } from "@/components/ChipGroup";
import { matchesCustomer } from "@/components/CustomerPicker";
import { CustomerFormModal } from "@/components/owner/CustomerFormModal";
import { PaymentModal } from "@/components/owner/PaymentModal";
import { Button, buttonClass } from "@/components/ui/Button";
import {
  Avatar,
  Badge,
  Card,
  EmptyState,
  PageHeader,
  SearchInput,
} from "@/components/ui/Primitives";
import { useApp } from "@/context/store";
import { formatDate, formatINR, formatMobile } from "@/lib/format";
import { balancesByCustomer, EMPTY_BALANCE } from "@/lib/ledger";
import type { Customer } from "@/lib/types";

type Filter = "all" | "dues";
type Sort = "dues" | "name" | "recent";

function DueBadge({ outstanding }: { outstanding: number }) {
  if (outstanding > 0)
    return <Badge tone="due">{formatINR(outstanding)} due</Badge>;
  if (outstanding < 0)
    return <Badge tone="advance">{formatINR(-outstanding)} advance</Badge>;
  return <Badge tone="clear">Settled</Badge>;
}

export default function CustomersPage() {
  const { customers, transactions } = useApp();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("dues");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [payFor, setPayFor] = useState("");

  const balances = useMemo(() => balancesByCustomer(transactions), [transactions]);

  const lastActivity = useMemo(() => {
    const m = new Map<string, string>();
    for (const t of transactions) {
      const prev = m.get(t.customerId);
      if (!prev || t.createdAt > prev) m.set(t.customerId, t.createdAt);
    }
    return m;
  }, [transactions]);

  const rows = useMemo(() => {
    const list = customers
      .filter((c) => matchesCustomer(c, query))
      .filter((c) =>
        filter === "dues" ? (balances.get(c.id)?.outstanding ?? 0) > 0 : true
      );
    list.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "recent") return b.joinedAt.localeCompare(a.joinedAt);
      return (
        (balances.get(b.id)?.outstanding ?? 0) -
        (balances.get(a.id)?.outstanding ?? 0)
      );
    });
    return list;
  }, [customers, query, filter, sort, balances]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (c: Customer) => {
    setEditing(c);
    setFormOpen(true);
  };
  const openPay = (id: string) => {
    setPayFor(id);
    setPayOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} customers on your khata`}
        actions={
          <Button onClick={openAdd}>
            <UserPlus className="h-4.5 w-4.5" aria-hidden="true" />
            Add customer
          </Button>
        }
      />

      <div className="mb-5 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <SearchInput
            className="flex-1"
            placeholder="Search by name or mobile number"
            aria-label="Search customers by name or mobile number"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <label className="sr-only" htmlFor="customer-sort">
            Sort customers
          </label>
          <select
            id="customer-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="h-[46px] rounded-xl border border-chai-200 bg-white px-3.5 text-base text-charcoal-700 focus:border-saffron-500 focus:outline-none focus:ring-2 focus:ring-saffron-500/25 sm:text-[15px]"
          >
            <option value="dues">Highest dues first</option>
            <option value="name">Name A–Z</option>
            <option value="recent">Recently added</option>
          </select>
        </div>
        <ChipGroup<Filter>
          label="Filter customers"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All customers" },
            { value: "dues", label: "With dues" },
          ]}
        />
      </div>

      {rows.length === 0 ? (
        <Card>
          {customers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No customers yet"
              description="Add your first customer to start tracking their khata."
              action={<Button onClick={openAdd}>Add customer</Button>}
            />
          ) : (
            <EmptyState
              icon={UserSearch}
              title="No customers found"
              description={
                query
                  ? `Nothing matches “${query}”. Check the spelling or try a few digits of the mobile number.`
                  : "No customers have dues right now."
              }
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery("");
                    setFilter("all");
                  }}
                >
                  Clear search and filters
                </Button>
              }
            />
          )}
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden overflow-hidden md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-chai-100 bg-cream-100 text-xs uppercase tracking-wide text-charcoal-500">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Customer</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Mobile</th>
                  <th scope="col" className="px-3 py-3 text-right font-semibold">Purchases</th>
                  <th scope="col" className="px-3 py-3 text-right font-semibold">Paid</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Balance</th>
                  <th scope="col" className="px-3 py-3 font-semibold">Last activity</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-chai-100">
                {rows.map((c) => {
                  const b = balances.get(c.id) ?? EMPTY_BALANCE;
                  const last = lastActivity.get(c.id);
                  return (
                    <tr key={c.id} className="hover:bg-cream-100/60">
                      <td className="px-5 py-3">
                        <Link
                          href={`/owner/customer/?id=${c.id}`}
                          className="flex items-center gap-3"
                        >
                          <Avatar name={c.name} />
                          <span>
                            <span className="block font-semibold text-charcoal-800 hover:text-saffron-700">
                              {c.name}
                            </span>
                            {c.locality ? (
                              <span className="block text-xs text-charcoal-400">
                                {c.locality}
                              </span>
                            ) : null}
                          </span>
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-charcoal-600">
                        {formatMobile(c.mobile)}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-charcoal-700">
                        {formatINR(b.purchases)}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-charcoal-700">
                        {formatINR(b.payments)}
                      </td>
                      <td className="px-3 py-3">
                        <DueBadge outstanding={b.outstanding} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-charcoal-500">
                        {last ? formatDate(last) : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openPay(c.id)}
                            aria-label={`Record payment for ${c.name}`}
                          >
                            <Wallet className="h-4 w-4" aria-hidden="true" />
                            Collect
                          </Button>
                          <Link
                            href={`/owner/customer/?id=${c.id}`}
                            className={buttonClass({ size: "sm", variant: "ghost" })}
                          >
                            Ledger
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEdit(c)}
                            aria-label={`Edit ${c.name}`}
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {rows.map((c) => {
              const b = balances.get(c.id) ?? EMPTY_BALANCE;
              return (
                <li key={c.id}>
                  <Card className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar name={c.name} />
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/owner/customer/?id=${c.id}`}
                          className="block truncate font-semibold text-charcoal-800"
                        >
                          {c.name}
                        </Link>
                        <p className="text-sm text-charcoal-500">
                          {formatMobile(c.mobile)}
                        </p>
                      </div>
                      <DueBadge outstanding={b.outstanding} />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <p className="rounded-lg bg-cream-100 px-3 py-2">
                        <span className="block text-xs text-charcoal-400">Purchases</span>
                        <span className="font-semibold tabular-nums">{formatINR(b.purchases)}</span>
                      </p>
                      <p className="rounded-lg bg-cream-100 px-3 py-2">
                        <span className="block text-xs text-charcoal-400">Paid</span>
                        <span className="font-semibold tabular-nums">{formatINR(b.payments)}</span>
                      </p>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1"
                        onClick={() => openPay(c.id)}
                      >
                        <Wallet className="h-4 w-4" aria-hidden="true" />
                        Collect
                      </Button>
                      <Link
                        href={`/owner/customer/?id=${c.id}`}
                        className={buttonClass({ size: "sm", variant: "secondary", className: "flex-1" })}
                      >
                        Ledger
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(c)}
                        aria-label={`Edit ${c.name}`}
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <CustomerFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        customer={editing}
      />
      <PaymentModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        customerId={payFor}
      />
    </>
  );
}
