"use client";

import { ChevronDown, KeyRound, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordField } from "@/components/auth/PasswordField";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { useApp } from "@/context/store";
import { formatMobile } from "@/lib/format";

export default function CustomerLoginPage() {
  const { session, customers, loginCustomer } = useApp();
  const { toast } = useToast();
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.role === "customer") router.replace("/customer");
  }, [session, router]);

  // Demo accounts come from the seeded customers (original nine, in order).
  const demoAccounts = customers
    .filter((c) => /^c\d+$/.test(c.id))
    .slice(0, 4);
  const primary = demoAccounts[0];

  const signIn = (m: string, p: string) => {
    const res = loginCustomer(m, p);
    if (res.ok) {
      toast({
        title: `Namaste, ${res.customer.name.split(" ")[0]}!`,
        description: "Signed in with a simulated demo login.",
      });
      router.push("/customer");
    } else {
      setError(res.error);
    }
  };

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    setError("");
    signIn(mobile, password);
  };

  return (
    <AuthShell
      heading="Customer sign in"
      subheading="Check your purchases, payments and balance anytime."
      panelTitle="Your khata, in your pocket."
      panelText="See every cup and snack you have taken, what you have paid, and what is left to settle — with dates and prices."
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <TextField
          label="Mobile number"
          type="tel"
          inputMode="numeric"
          autoComplete="username"
          placeholder="10-digit mobile number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
        />
        <Button type="submit" full size="lg">
          <LogIn className="h-4.5 w-4.5" aria-hidden="true" />
          Sign in
        </Button>
      </form>

      {primary ? (
        <div className="mt-5 rounded-xl border border-chai-100 bg-cream-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-chai-700">
            <KeyRound className="h-4 w-4" aria-hidden="true" />
            Demo customer credentials
          </div>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
            <dt className="text-charcoal-400">Name</dt>
            <dd className="text-charcoal-700">{primary.name}</dd>
            <dt className="text-charcoal-400">Mobile</dt>
            <dd className="font-mono text-charcoal-700">{primary.mobile}</dd>
            <dt className="text-charcoal-400">Password</dt>
            <dd className="font-mono text-charcoal-700">{primary.password}</dd>
          </dl>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setMobile(primary.mobile);
                setPassword(primary.password);
                setError("");
              }}
            >
              Fill credentials
            </Button>
            <Button
              size="sm"
              onClick={() => signIn(primary.mobile, primary.password)}
            >
              Sign in as {primary.name.split(" ")[0]}
            </Button>
          </div>

          <details className="group mt-4 border-t border-chai-100 pt-3">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-chai-600">
              More demo accounts
              <ChevronDown
                className="h-4 w-4 transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <ul className="mt-2 space-y-1">
              {demoAccounts.slice(1).map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setMobile(c.mobile);
                      setPassword(c.password);
                      setError("");
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left text-sm hover:bg-chai-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron-500"
                  >
                    <span className="text-charcoal-700">{c.name}</span>
                    <span className="font-mono text-xs text-charcoal-400">
                      {formatMobile(c.mobile).replace("+91 ", "")} · {c.password}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-charcoal-400">
              Customers the owner adds during this session can sign in with the
              password generated for them.
            </p>
          </details>
        </div>
      ) : null}
    </AuthShell>
  );
}
