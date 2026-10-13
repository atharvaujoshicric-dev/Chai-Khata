"use client";

import { History, Home, LogOut, UserRound, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Primitives";
import { useToast } from "@/components/ui/Toast";
import { useApp } from "@/context/store";

const TABS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/customer", label: "Home", icon: Home },
  { href: "/customer/history", label: "History", icon: History },
  { href: "/customer/profile", label: "Profile", icon: UserRound },
];

function isActive(rawPath: string, href: string): boolean {
  const pathname = rawPath.replace(/\/+$/, "") || "/";
  if (href === "/customer") return pathname === "/customer";
  // Password screen lives under the Profile tab.
  if (href === "/customer/profile")
    return pathname === href || pathname === "/customer/password";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function CustomerShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useApp();
  const { toast } = useToast();

  const signOut = () => {
    logout();
    toast({ title: "Signed out", tone: "info" });
    router.push("/");
  };

  return (
    <div className="min-h-dvh">
      <header className="pt-safe sticky top-0 z-30 border-b border-chai-100 bg-cream-50/90 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3 px-4 py-2.5 md:max-w-3xl">
          <Logo subtitle={false} />

          <nav aria-label="Customer navigation" className="hidden items-center gap-1 md:flex">
            {TABS.map((t) => {
              const active = isActive(pathname, t.href);
              const Icon = t.icon;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron-500 ${
                    active
                      ? "bg-saffron-100 text-saffron-700"
                      : "text-charcoal-500 hover:bg-chai-50"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {t.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={signOut}
            aria-label="Sign out"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-charcoal-500 hover:bg-chai-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron-500"
          >
            <LogOut className="h-4.5 w-4.5" aria-hidden="true" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 pb-28 pt-5 md:max-w-3xl md:pb-12 md:pt-8">
        {children}
      </main>

      <nav
        aria-label="Customer navigation"
        className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-chai-100 bg-cream-50/95 backdrop-blur md:hidden"
      >
        <div className="mx-auto flex max-w-xl">
          {TABS.map((t) => {
            const active = isActive(pathname, t.href);
            const Icon = t.icon;
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium focus:outline-none focus-visible:bg-chai-50 ${
                  active ? "text-saffron-700" : "text-charcoal-400"
                }`}
              >
                <Icon className="h-5.5 w-5.5" aria-hidden="true" />
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
