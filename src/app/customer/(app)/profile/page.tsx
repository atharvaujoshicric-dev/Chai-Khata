"use client";

import {
  CalendarDays,
  ChevronRight,
  KeyRound,
  LogOut,
  MapPin,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useToast } from "@/components/ui/Toast";
import { Avatar, Card } from "@/components/ui/Primitives";
import { useApp } from "@/context/store";
import { formatDate, formatINR, formatMobile } from "@/lib/format";
import { computeBalance } from "@/lib/ledger";

export default function CustomerProfilePage() {
  const { currentCustomer, transactions, logout } = useApp();
  const { toast } = useToast();
  const router = useRouter();

  const balance = useMemo(
    () => computeBalance(transactions, currentCustomer?.id ?? ""),
    [transactions, currentCustomer?.id]
  );
  if (!currentCustomer) return null;

  const details = [
    { icon: Phone, label: "Mobile", value: formatMobile(currentCustomer.mobile) },
    {
      icon: MapPin,
      label: "Area",
      value: currentCustomer.locality || "Not provided",
    },
    {
      icon: CalendarDays,
      label: "Customer since",
      value: formatDate(currentCustomer.joinedAt),
    },
  ];

  return (
    <>
      <div className="flex flex-col items-center text-center">
        <Avatar name={currentCustomer.name} size="lg" />
        <h1 className="mt-3 font-display text-2xl font-semibold text-chai-800">
          {currentCustomer.name}
        </h1>
        <p className="mt-0.5 text-sm text-charcoal-500">
          {balance.outstanding > 0
            ? `${formatINR(balance.outstanding)} outstanding`
            : balance.outstanding < 0
              ? `${formatINR(-balance.outstanding)} advance`
              : "All settled"}
        </p>
      </div>

      <Card className="mt-6 divide-y divide-chai-100">
        {details.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 px-4 py-3.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-chai-50 text-chai-500">
              <Icon className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs text-charcoal-400">{label}</p>
              <p className="font-medium text-charcoal-800">{value}</p>
            </div>
          </div>
        ))}
      </Card>
      <p className="mt-2 px-1 text-xs text-charcoal-400">
        To change your name or mobile number, please ask the stall owner.
      </p>

      <Card className="mt-6 divide-y divide-chai-100">
        <Link
          href="/customer/password"
          className="flex items-center gap-3 px-4 py-3.5 hover:bg-cream-100 focus:outline-none focus-visible:bg-cream-100"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-saffron-100 text-saffron-700">
            <KeyRound className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <span className="flex-1 font-medium text-charcoal-800">
            Change password
          </span>
          <ChevronRight className="h-5 w-5 text-charcoal-300" aria-hidden="true" />
        </Link>
        <button
          type="button"
          onClick={() => {
            logout();
            toast({ title: "Signed out", tone: "info" });
            router.push("/");
          }}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-rose-50 focus:outline-none focus-visible:bg-rose-50"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <LogOut className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <span className="flex-1 font-medium text-rose-700">Sign out</span>
        </button>
      </Card>

      <p className="mt-6 text-center text-xs text-charcoal-400">
        Simulated demo login · no real account exists
      </p>
    </>
  );
}
