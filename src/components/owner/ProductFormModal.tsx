"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useApp } from "@/context/store";
import { formatINR } from "@/lib/format";
import {
  PRODUCT_CATEGORIES,
  type Product,
  type ProductCategory,
} from "@/lib/types";
import { parseAmount } from "@/lib/validation";

export function ProductFormModal({
  open,
  onClose,
  product,
}: {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
}) {
  if (!open) return null;
  return (
    <ProductForm
      key={product?.id ?? "new"}
      onClose={onClose}
      product={product ?? null}
    />
  );
}

function ProductForm({
  onClose,
  product,
}: {
  onClose: () => void;
  product: Product | null;
}) {
  const { addProduct, updateProduct } = useApp();
  const { toast } = useToast();
  const editing = product !== null;

  const [name, setName] = useState(product?.name ?? "");
  const [category, setCategory] = useState<ProductCategory>(
    product?.category ?? "Tea"
  );
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [active, setActive] = useState(product?.active ?? true);
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

  const parsed = parseAmount(price);
  const priceChanged =
    editing && product && Number.isFinite(parsed) && parsed > 0 && parsed !== product.price;

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = "Enter the product name.";
    if (!Number.isFinite(parsed) || parsed <= 0)
      next.price = "Enter a price greater than ₹0.";
    else if (parsed > 100000) next.price = "That price looks too high.";
    if (next.name || next.price) {
      setErrors(next);
      return;
    }

    if (editing && product) {
      const res = updateProduct(product.id, { name, category, price: parsed, active });
      if (!res.ok) {
        setErrors({ name: res.error });
        return;
      }
      toast({
        title: "Product updated",
        description: priceChanged
          ? `${res.product.name} is now ${formatINR(res.product.price)}. Past bills are unchanged.`
          : res.product.name,
      });
    } else {
      const res = addProduct({ name, category, price: parsed, active });
      if (!res.ok) {
        setErrors({ name: res.error });
        return;
      }
      toast({
        title: "Product added",
        description: `${res.product.name} · ${formatINR(res.product.price)}`,
      });
    }
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? "Edit product" : "Add product"}
      description={
        editing
          ? "Price changes apply to new purchases only."
          : "Add an item you sell at the stall."
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="product-form">
            {editing ? "Save changes" : "Add product"}
          </Button>
        </>
      }
    >
      <form id="product-form" onSubmit={onSubmit} className="space-y-4" noValidate>
        <TextField
          label="Product name"
          autoFocus
          autoComplete="off"
          placeholder="e.g. Masala Chai"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErrors((er) => ({ ...er, name: undefined }));
          }}
          error={errors.name}
        />
        <SelectField
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value as ProductCategory)}
        >
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </SelectField>
        <TextField
          label="Price per unit"
          prefix="₹"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0"
          value={price}
          onChange={(e) => {
            setPrice(e.target.value);
            setErrors((er) => ({ ...er, price: undefined }));
          }}
          error={errors.price}
          hint={
            priceChanged && product
              ? `Changing from ${formatINR(product.price)} to ${formatINR(parsed)}. Existing transactions keep the price they were billed at.`
              : undefined
          }
        />
        {editing ? (
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-chai-100 bg-cream-100 p-3.5">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="mt-0.5 h-4.5 w-4.5 rounded border-chai-300 text-saffron-600 focus:ring-saffron-500"
            />
            <span>
              <span className="block text-sm font-medium text-charcoal-800">
                Available for sale
              </span>
              <span className="block text-sm text-charcoal-500">
                Turn off to hide it from new purchases. History is kept.
              </span>
            </span>
          </label>
        ) : null}
      </form>
    </Modal>
  );
}
