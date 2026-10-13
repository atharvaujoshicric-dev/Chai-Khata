"use client";

import { Info, PackageSearch, Pencil, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { ChipGroup } from "@/components/ChipGroup";
import { ProductFormModal } from "@/components/owner/ProductFormModal";
import { CATEGORY_ICONS } from "@/components/owner/productIcons";
import { Button } from "@/components/ui/Button";
import {
  Badge,
  Card,
  EmptyState,
  PageHeader,
  SearchInput,
} from "@/components/ui/Primitives";
import { useApp } from "@/context/store";
import { formatDate, formatINR } from "@/lib/format";
import { PRODUCT_CATEGORIES, type Product, type ProductCategory } from "@/lib/types";

type CategoryFilter = "all" | ProductCategory;

export default function ProductsPage() {
  const { products } = useApp();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter((p) => category === "all" || p.category === category)
      .filter((p) => !q || p.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products, query, category]);

  const categoriesInUse = PRODUCT_CATEGORIES.filter((c) =>
    products.some((p) => p.category === c)
  );

  return (
    <>
      <PageHeader
        title="Products"
        subtitle={`${products.length} items · ${products.filter((p) => p.active).length} available`}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4.5 w-4.5" aria-hidden="true" />
            Add product
          </Button>
        }
      />

      <p className="mb-5 flex items-start gap-2 rounded-xl border border-chai-100 bg-cream-50 px-4 py-3 text-sm text-charcoal-600">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-saffron-600" aria-hidden="true" />
        Changing a price only affects new purchases. Bills already recorded keep
        the price they were charged at.
      </p>

      <div className="mb-5 space-y-3">
        <SearchInput
          placeholder="Search products"
          aria-label="Search products"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <ChipGroup<CategoryFilter>
          label="Filter by category"
          value={category}
          onChange={setCategory}
          options={[
            { value: "all", label: "All" },
            ...categoriesInUse.map((c) => ({ value: c, label: c })),
          ]}
        />
      </div>

      {rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={PackageSearch}
            title="No products found"
            description={
              products.length === 0
                ? "Add the items you sell, like tea, coffee and snacks."
                : "Try a different search or category."
            }
            action={
              products.length === 0 ? (
                <Button onClick={() => setFormOpen(true)}>Add product</Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery("");
                    setCategory("all");
                  }}
                >
                  Clear filters
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {rows.map((p) => {
            const Icon = CATEGORY_ICONS[p.category];
            return (
              <li key={p.id}>
                <Card className={`flex h-full flex-col p-4 ${p.active ? "" : "opacity-70"}`}>
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-saffron-100 text-saffron-700">
                      <Icon className="h-5.5 w-5.5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate font-semibold text-charcoal-800">{p.name}</h2>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <Badge tone="neutral">{p.category}</Badge>
                        {!p.active ? <Badge tone="off">Unavailable</Badge> : null}
                      </div>
                    </div>
                    <p className="font-display text-2xl font-semibold tabular-nums text-chai-800">
                      {formatINR(p.price)}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-chai-100 pt-3">
                    <p className="text-xs text-charcoal-400">
                      Price set {formatDate(p.priceUpdatedAt)}
                    </p>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEditing(p);
                        setFormOpen(true);
                      }}
                      aria-label={`Edit ${p.name}`}
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      Edit
                    </Button>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <ProductFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        product={editing}
      />
    </>
  );
}
