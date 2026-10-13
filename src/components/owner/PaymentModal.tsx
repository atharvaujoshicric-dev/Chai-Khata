"use client";

import { useMemo, useState, type FormEvent } from "react";
import { CustomerPicker } from "@/components/CustomerPicker";
import { Button } from "@/components/ui/Button";
import { TextAreaField, TextField } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useApp } from "@/context/store";
import { formatINR, round2 } from "@/lib/format";
import { balancesByCustomer } from "@/lib/ledger";
import { PAYMENT_METHODS, type PaymentMethod } from "@/lib/types";
import { parseAmount } from "@/lib/validation";

export function PaymentModal({
  open,
  onClose,
  customerId,
}: {
  open: boolean;
  onClose: () => void;
  /** Pre-select a customer (e.g. from a ledger row). */
  customerId?: string;
}) {
  if (!open) return null;
  return <PaymentForm onClose={onClose} initialCustomerId={customerId ?? ""} />;
}

function PaymentForm({
  onClose,
  initialCustomerId,
}: {
  onClose: () => void;
  initialCustomerId: string;
}) {
  const { customers, transactions, addPayment } = useApp();
  const { toast } = useToast();
  const balances = useMemo(() => balancesByCustomer(transactions), [transactions]);

  const [customerId, setCustomerId] = useState(initialCustomerId);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("Cash");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<{ customer?: string; amount?: string }>({});

  const customer = customers.find((c) => c.id === customerId);
  const due = balances.get(customerId)?.outstanding ?? 0;
  const parsed = parseAmount(amount);
  const valid = Number.isFinite(parsed) && parsed > 0;
  const after = valid ? round2(due - parsed) : due;

  const quick = [100, 200, 500].filter((v) => v < due);

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    const next: typeof errors = {};
    if (!customer) next.customer = "Select a customer.";
    if (!valid) next.amount = "Enter an amount greater than ₹0.";
    if (next.customer || next.amount) {
      setErrors(next);
      return;
    }
    const res = addPayment({ customerId, amount: parsed, method, note });
    if (!res.ok) {
      setErrors({ amount: res.error });
      return;
    }
    toast({
      title: `${formatINR(res.transaction.amount)} received`,
      description: `${customer?.name} · ${method}`,
    });
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Record payment"
      description="Money received from a customer reduces their dues."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="payment-form">
            Record payment
          </Button>
        </>
      }
    >
      <form id="payment-form" onSubmit={onSubmit} className="space-y-4" noValidate>
        <CustomerPicker
          customers={customers}
          balances={balances}
          value={customerId}
          onChange={(id) => {
            setCustomerId(id);
            setErrors((e) => ({ ...e, customer: undefined }));
          }}
          error={errors.customer}
        />

        <TextField
          label="Amount received"
          prefix="₹"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0"
          autoFocus={Boolean(initialCustomerId)}
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setErrors((er) => ({ ...er, amount: undefined }));
          }}
          error={errors.amount}
        />

        {customer && (due > 0 || quick.length > 0) ? (
          <div className="-mt-2 flex flex-wrap gap-2">
            {due > 0 ? (
              <button
                type="button"
                onClick={() => setAmount(String(due))}
                className="rounded-full border border-saffron-300 bg-saffron-50 px-3 py-1.5 text-sm font-semibold text-saffron-700 hover:bg-saffron-100"
              >
                Full due {formatINR(due)}
              </button>
            ) : null}
            {quick.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setAmount(String(v))}
                className="rounded-full border border-chai-200 bg-white px-3 py-1.5 text-sm font-medium text-chai-600 hover:bg-chai-50"
              >
                {formatINR(v)}
              </button>
            ))}
          </div>
        ) : null}

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-charcoal-700">
            Payment method
          </legend>
          <div className="grid grid-cols-2 gap-2" role="radiogroup">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={method === m}
                onClick={() => setMethod(m)}
                className={`h-11 rounded-xl border text-[15px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron-500 ${
                  method === m
                    ? "border-saffron-500 bg-saffron-50 text-saffron-700"
                    : "border-chai-200 bg-white text-charcoal-600 hover:bg-chai-50"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </fieldset>

        <TextAreaField
          label="Note (optional)"
          rows={2}
          placeholder="e.g. Paid by his brother"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        {customer && valid ? (
          <div className="rounded-xl border border-chai-100 bg-cream-100 p-3.5 text-sm">
            <div className="flex justify-between text-charcoal-600">
              <span>Current balance</span>
              <span className="tabular-nums">
                {due >= 0 ? formatINR(due) : `${formatINR(-due)} advance`}
              </span>
            </div>
            <div className="mt-1 flex justify-between font-semibold text-charcoal-800">
              <span>Balance after payment</span>
              <span
                className={`tabular-nums ${after < 0 ? "text-sky-700" : after === 0 ? "text-emerald-700" : ""}`}
              >
                {after < 0
                  ? `${formatINR(-after)} advance`
                  : after === 0
                    ? "Settled"
                    : formatINR(after)}
              </span>
            </div>
            {after < 0 ? (
              <p className="mt-2 text-xs text-sky-700">
                This is more than the amount due; the extra is kept as an
                advance for future purchases.
              </p>
            ) : null}
          </div>
        ) : null}
      </form>
    </Modal>
  );
}
