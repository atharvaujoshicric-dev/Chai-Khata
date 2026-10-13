"use client";

import { Copy, KeyRound, RotateCcw } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useApp } from "@/context/store";
import { copyText } from "@/lib/clipboard";
import { formatMobile } from "@/lib/format";
import type { Customer } from "@/lib/types";
import {
  generateInitialPassword,
  isValidMobile,
  normalizeMobile,
} from "@/lib/validation";

export function CustomerFormModal({
  open,
  onClose,
  customer,
}: {
  open: boolean;
  onClose: () => void;
  customer?: Customer | null;
}) {
  if (!open) return null;
  return (
    <CustomerForm
      key={customer?.id ?? "new"}
      onClose={onClose}
      customer={customer ?? null}
    />
  );
}

function CustomerForm({
  onClose,
  customer,
}: {
  onClose: () => void;
  customer: Customer | null;
}) {
  const { addCustomer, updateCustomer, resetPassword } = useApp();
  const { toast } = useToast();
  const editing = customer !== null;

  const [name, setName] = useState(customer?.name ?? "");
  const [mobile, setMobile] = useState(customer?.mobile ?? "");
  const [locality, setLocality] = useState(customer?.locality ?? "");
  const [errors, setErrors] = useState<{ name?: string; mobile?: string }>({});
  const [created, setCreated] = useState<{
    name: string;
    mobile: string;
    password: string;
  } | null>(null);
  const [resetTo, setResetTo] = useState<string | null>(null);

  const previewReady =
    /[a-z]/i.test(name) && normalizeMobile(mobile).length >= 4;
  const preview = previewReady ? generateInitialPassword(name, mobile) : "";

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = "Enter the customer's name.";
    if (!isValidMobile(normalizeMobile(mobile)))
      next.mobile = "Enter a valid 10-digit mobile number (starting 6–9).";
    if (next.name || next.mobile) {
      setErrors(next);
      return;
    }

    if (editing && customer) {
      const res = updateCustomer(customer.id, { name, mobile, locality });
      if (!res.ok) {
        setErrors({ mobile: res.error });
        return;
      }
      toast({ title: "Customer updated", description: res.customer.name });
      onClose();
    } else {
      const res = addCustomer({ name, mobile, locality });
      if (!res.ok) {
        setErrors({ mobile: res.error });
        return;
      }
      toast({
        title: "Customer added",
        description: `${res.customer.name} can now sign in.`,
      });
      setCreated({
        name: res.customer.name,
        mobile: res.customer.mobile,
        password: res.initialPassword,
      });
    }
  };

  if (created) {
    return (
      <Modal
        open
        onClose={onClose}
        title="Customer onboarded"
        description={`Share these sign-in details with ${created.name}.`}
        footer={<Button onClick={onClose}>Done</Button>}
      >
        <div className="rounded-xl border border-saffron-200 bg-saffron-50 p-4">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-charcoal-500">Mobile</dt>
            <dd className="font-mono font-semibold text-charcoal-800">
              {created.mobile}
            </dd>
            <dt className="text-charcoal-500">Initial password</dt>
            <dd className="font-mono font-semibold text-charcoal-800">
              {created.password}
            </dd>
          </dl>
          <Button
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={async () => {
              const ok = await copyText(
                `Chai Khata login\nMobile: ${created.mobile}\nPassword: ${created.password}`
              );
              toast({
                title: ok ? "Copied to clipboard" : "Could not copy",
                tone: ok ? "success" : "error",
              });
            }}
          >
            <Copy className="h-4 w-4" aria-hidden="true" />
            Copy details
          </Button>
        </div>
        <p className="mt-4 text-sm text-charcoal-500">
          The password is the first 3 letters of the first name plus the first 4
          digits of the mobile number. The customer can change it from their
          profile.
        </p>
      </Modal>
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? "Edit customer" : "Add customer"}
      description={
        editing
          ? "Update contact details."
          : "A sign-in password is generated automatically."
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="customer-form">
            {editing ? "Save changes" : "Add customer"}
          </Button>
        </>
      }
    >
      <form id="customer-form" onSubmit={onSubmit} className="space-y-4" noValidate>
        <TextField
          label="Full name"
          autoFocus
          autoComplete="off"
          placeholder="e.g. Rajesh Kumar"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErrors((er) => ({ ...er, name: undefined }));
          }}
          error={errors.name}
        />
        <TextField
          label="Mobile number"
          type="tel"
          inputMode="numeric"
          autoComplete="off"
          placeholder="10-digit mobile number"
          value={mobile}
          onChange={(e) => {
            setMobile(e.target.value);
            setErrors((er) => ({ ...er, mobile: undefined }));
          }}
          error={errors.mobile}
        />
        <TextField
          label="Area / locality (optional)"
          autoComplete="off"
          placeholder="e.g. Shivaji Nagar"
          value={locality}
          onChange={(e) => setLocality(e.target.value)}
        />

        {!editing ? (
          <div className="rounded-xl border border-chai-100 bg-cream-100 p-3.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-chai-700">
              <KeyRound className="h-4 w-4" aria-hidden="true" />
              Initial password
            </div>
            <p className="mt-1.5 font-mono text-lg font-semibold text-charcoal-800">
              {preview || "—"}
            </p>
            <p className="mt-1 text-xs text-charcoal-400">
              First 3 letters of the first name (lowercase) + first 4 digits of
              the mobile number.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-chai-100 bg-cream-100 p-3.5">
            <p className="text-sm text-charcoal-600">
              Customer forgot their password? Reset it to the initial password
              ({previewReady ? preview : "—"}).
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-2.5"
              onClick={() => {
                if (!customer) return;
                const pw = resetPassword(customer.id);
                if (pw) {
                  setResetTo(pw);
                  toast({ title: "Password reset", description: "Share the new password with the customer." });
                }
              }}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset password
            </Button>
            {resetTo ? (
              <p className="mt-2.5 text-sm text-charcoal-600">
                Password is now{" "}
                <span className="font-mono font-semibold">{resetTo}</span> for{" "}
                {formatMobile(customer?.mobile ?? "")}.
              </p>
            ) : null}
          </div>
        )}
      </form>
    </Modal>
  );
}
