"use client";

import { ArrowRight, Store, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useApp } from "@/context/store";
import { Logo, SimulatedNotice } from "@/components/ui/Primitives";

export default function WelcomePage() {
  const { session } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (session?.role === "owner") router.replace("/owner");
    else if (session?.role === "customer") router.replace("/customer");
  }, [session, router]);

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[28rem] bg-gradient-to-b from-saffron-100/70 to-transparent"
      />
      <div className="relative mx-auto flex min-h-dvh max-w-5xl flex-col px-5 py-6 sm:px-8">
        <header>
          <Logo />
        </header>

        <main className="flex flex-1 flex-col justify-center py-12">
          <p className="text-sm font-semibold uppercase tracking-widest text-saffron-700">
            Digital tea-stall ledger
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-tight text-chai-800 sm:text-5xl">
            Every cup, every payment —{" "}
            <span className="text-saffron-600">neatly on the khata.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-charcoal-500">
            Track what each customer buys, what they have paid, and what is
            still due. Choose how you want to sign in.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Link
              href="/owner/login"
              className="group rounded-2xl border border-chai-100 bg-cream-50 p-6 shadow-card transition hover:-translate-y-0.5 hover:border-saffron-300 hover:shadow-pop focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron-500"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-chai-800 text-saffron-300">
                <Store className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2 className="mt-4 font-display text-xl font-semibold text-chai-800">
                I run the stall
              </h2>
              <p className="mt-1 text-charcoal-500">
                Manage customers, prices, purchases and payments.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 font-semibold text-saffron-700">
                Owner sign in
                <ArrowLeftRight />
              </span>
            </Link>

            <Link
              href="/customer/login"
              className="group rounded-2xl border border-chai-100 bg-cream-50 p-6 shadow-card transition hover:-translate-y-0.5 hover:border-saffron-300 hover:shadow-pop focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron-500"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-saffron-500 text-white">
                <UserRound className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2 className="mt-4 font-display text-xl font-semibold text-chai-800">
                I am a customer
              </h2>
              <p className="mt-1 text-charcoal-500">
                See your purchases, payments and what you owe.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 font-semibold text-saffron-700">
                Customer sign in
                <ArrowLeftRight />
              </span>
            </Link>
          </div>

          <SimulatedNotice className="mt-8 max-w-2xl" />
        </main>
      </div>
    </div>
  );
}

function ArrowLeftRight() {
  return (
    <ArrowRight
      className="h-4 w-4 transition-transform group-hover:translate-x-1"
      aria-hidden="true"
    />
  );
}
