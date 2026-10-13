"use client";

import { KeyRound, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordField } from "@/components/auth/PasswordField";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { DEMO_OWNER, useApp } from "@/context/store";

export default function OwnerLoginPage() {
  const { session, loginOwner } = useApp();
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.role === "owner") router.replace("/owner");
  }, [session, router]);

  const signIn = (e: string, p: string) => {
    if (loginOwner(e, p)) {
      toast({ title: "Welcome back!", description: "Signed in as the demo owner." });
      router.push("/owner");
    } else {
      setError("Email or password is incorrect. Try the demo credentials below.");
    }
  };

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    setError("");
    signIn(email, password);
  };

  return (
    <AuthShell
      heading="Owner sign in"
      subheading="Open your khata and see how the day is going."
      panelTitle="Know who owes what, at a glance."
      panelText="Record purchases in seconds, collect payments, and keep every customer's ledger accurate."
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <TextField
          label="Email"
          type="email"
          autoComplete="username"
          inputMode="email"
          placeholder={DEMO_OWNER.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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

      <div className="mt-5 rounded-xl border border-chai-100 bg-cream-50 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-chai-700">
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          Demo owner credentials
        </div>
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="text-charcoal-400">Email</dt>
          <dd className="break-all font-mono text-charcoal-700">{DEMO_OWNER.email}</dd>
          <dt className="text-charcoal-400">Password</dt>
          <dd className="font-mono text-charcoal-700">{DEMO_OWNER.password}</dd>
        </dl>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setEmail(DEMO_OWNER.email);
              setPassword(DEMO_OWNER.password);
              setError("");
            }}
          >
            Fill credentials
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => signIn(DEMO_OWNER.email, DEMO_OWNER.password)}
          >
            Sign in as demo owner
          </Button>
        </div>
      </div>
    </AuthShell>
  );
}
