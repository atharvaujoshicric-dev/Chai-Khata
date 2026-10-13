"use client";

import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { PasswordField } from "@/components/auth/PasswordField";
import { Button, buttonClass } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Card } from "@/components/ui/Primitives";
import { useApp } from "@/context/store";

export default function ChangePasswordPage() {
  const { currentCustomer, changePassword } = useApp();
  const { toast } = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{
    current?: string;
    next?: string;
    confirm?: string;
  }>({});
  const [done, setDone] = useState(false);

  if (!currentCustomer) return null;

  const rules = [
    { ok: next.length >= 6, label: "At least 6 characters" },
    { ok: next.length > 0 && next !== current, label: "Different from your current password" },
    { ok: next.length > 0 && next === confirm, label: "Matches the confirmation" },
  ];

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    const e: typeof errors = {};
    if (!current) e.current = "Enter your current password.";
    if (next.length < 6) e.next = "Use at least 6 characters.";
    else if (next === current) e.next = "Choose a different password.";
    if (confirm !== next) e.confirm = "The two passwords do not match.";
    if (e.current || e.next || e.confirm) {
      setErrors(e);
      return;
    }
    const res = changePassword(currentCustomer.id, current, next);
    if (!res.ok) {
      setErrors({ current: res.error });
      return;
    }
    toast({
      title: "Password changed",
      description: "Use your new password next time you sign in.",
    });
    setCurrent("");
    setNext("");
    setConfirm("");
    setErrors({});
    setDone(true);
  };

  return (
    <>
      <Link
        href="/customer/profile"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-chai-600 hover:text-saffron-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Profile
      </Link>
      <h1 className="font-display text-2xl font-semibold text-chai-800">
        Change password
      </h1>
      <p className="mb-5 mt-1 text-sm text-charcoal-500">
        Pick something only you know. You started with the password the stall
        owner shared.
      </p>

      {done ? (
        <Card className="p-5">
          <p
            role="status"
            className="flex items-start gap-2.5 text-emerald-800"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            Your password has been updated.
          </p>
          <div className="mt-4 flex gap-2">
            <Link href="/customer/profile" className={buttonClass()}>
              Back to profile
            </Link>
            <Button variant="secondary" onClick={() => setDone(false)}>
              Change again
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-5">
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <PasswordField
              label="Current password"
              autoComplete="current-password"
              value={current}
              onChange={(e) => {
                setCurrent(e.target.value);
                setErrors((er) => ({ ...er, current: undefined }));
              }}
              error={errors.current}
            />
            <PasswordField
              label="New password"
              autoComplete="new-password"
              value={next}
              onChange={(e) => {
                setNext(e.target.value);
                setErrors((er) => ({ ...er, next: undefined }));
              }}
              error={errors.next}
            />
            <PasswordField
              label="Confirm new password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => {
                setConfirm(e.target.value);
                setErrors((er) => ({ ...er, confirm: undefined }));
              }}
              error={errors.confirm}
            />

            <ul className="space-y-1.5 rounded-xl bg-cream-100 p-3.5 text-sm" aria-label="Password requirements">
              {rules.map((r) => (
                <li
                  key={r.label}
                  className={`flex items-center gap-2 ${r.ok ? "text-emerald-700" : "text-charcoal-500"}`}
                >
                  {r.ok ? (
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Circle className="h-4 w-4" aria-hidden="true" />
                  )}
                  {r.label}
                </li>
              ))}
            </ul>

            <Button type="submit" size="lg" full>
              Update password
            </Button>
          </form>
        </Card>
      )}

      <p className="mt-4 text-xs text-charcoal-400">
        Demo only: the new password is kept in memory for this session and is
        never sent anywhere.
      </p>
    </>
  );
}
