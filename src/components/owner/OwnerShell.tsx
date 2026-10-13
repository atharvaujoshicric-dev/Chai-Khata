"use client";

import {
  History,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Package,
  Plus,
  ReceiptText,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Logo } from "@/components/ui/Primitives";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useApp } from "@/context/store";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { href: "/owner", label: "Dashboard", icon: LayoutDashboard },
  { href: "/owner/customers", label: "Customers", icon: Users },
  { href: "/owner/products", label: "Products", icon: Package },
  { href: "/owner/purchases/new", label: "New purchase", icon: ReceiptText },
  { href: "/owner/payments", label: "Payments", icon: Wallet },
  { href: "/owner/transactions", label: "Transactions", icon: History },
];

function isActive(rawPath: string, href: string): boolean {
  const pathname = rawPath.replace(/\/+$/, "") || "/";
  if (href === "/owner") return pathname === "/owner";
  // The customer ledger lives at /owner/customer/?id=..., under the Customers tab.
  if (href === "/owner/customers")
    return pathname === href || pathname === "/owner/customer";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function OwnerShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useApp();
  const { toast } = useToast();
  const [moreOpen, setMoreOpen] = useState(false);

  const signOut = () => {
    setMoreOpen(false);
    logout();
    toast({ title: "Signed out", tone: "info" });
    router.push("/");
  };

  const tab = (item: NavItem, label = item.label) => {
    const active = isActive(pathname, item.href);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium focus:outline-none focus-visible:bg-chai-50 ${
          active ? "text-saffron-700" : "text-charcoal-400"
        }`}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
        {label}
      </Link>
    );
  };

  const moreActive =
    isActive(pathname, "/owner/products") ||
    isActive(pathname, "/owner/transactions");

  return (
    <div className="min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-chai-900 px-4 py-6 text-cream-50 md:flex">
        <div className="px-2">
          <Logo tone="light" />
        </div>
        <nav className="mt-8 flex-1 space-y-1" aria-label="Owner navigation">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400 ${
                  active
                    ? "bg-saffron-500/20 text-saffron-200"
                    : "text-chai-200 hover:bg-white/5 hover:text-cream-50"
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-sm font-semibold">Stall Owner</p>
          <p className="text-xs text-chai-300">Simulated demo login</p>
          <button
            type="button"
            onClick={signOut}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="pt-safe sticky top-0 z-30 border-b border-chai-100 bg-cream-50/90 backdrop-blur md:hidden">
        <div className="flex items-center justify-between px-4 py-2.5">
          <Logo subtitle={false} />
          <span className="rounded-full bg-saffron-100 px-2.5 py-1 text-xs font-semibold text-saffron-700">
            Demo
          </span>
        </div>
      </header>

      <main className="md:pl-64">
        <div className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 md:pb-12 lg:px-8 lg:pt-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Owner navigation"
        className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-chai-100 bg-cream-50/95 backdrop-blur md:hidden"
      >
        <div className="mx-auto flex max-w-lg items-end px-1">
          {tab(NAV[0], "Home")}
          {tab(NAV[1])}
          <div className="flex flex-1 justify-center">
            <Link
              href="/owner/purchases/new"
              aria-label="New purchase"
              className="-mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-saffron-600 text-white shadow-pop ring-4 ring-cream-100 focus:outline-none focus-visible:ring-saffron-300"
            >
              <Plus className="h-7 w-7" aria-hidden="true" />
            </Link>
          </div>
          {tab(NAV[4])}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium focus:outline-none focus-visible:bg-chai-50 ${
              moreActive ? "text-saffron-700" : "text-charcoal-400"
            }`}
          >
            <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
            More
          </button>
        </div>
      </nav>

      <Modal open={moreOpen} onClose={() => setMoreOpen(false)} title="More" size="sm">
        <ul className="space-y-1">
          {[NAV[2], NAV[5]].map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 font-medium text-charcoal-700 hover:bg-chai-50"
                >
                  <Icon className="h-5 w-5 text-saffron-600" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={signOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left font-medium text-rose-700 hover:bg-rose-50"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
              Sign out
            </button>
          </li>
        </ul>
        <p className="mt-3 text-xs text-charcoal-400">
          Simulated demo login · data resets on reload
        </p>
      </Modal>
    </div>
  );
}
