export type ProductCategory =
  | "Tea"
  | "Coffee"
  | "Snacks"
  | "Biscuits"
  | "Cigarettes"
  | "Other";

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "Tea",
  "Coffee",
  "Snacks",
  "Biscuits",
  "Cigarettes",
  "Other",
];

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  locality: string;
  joinedAt: string; // ISO
  /** Simulated only. Held in memory, never persisted anywhere. */
  password: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  active: boolean;
  priceUpdatedAt: string; // ISO
}

/** A snapshot of the product at the time of sale. Never mutated afterwards. */
export interface PurchaseLine {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export type PaymentMethod = "Cash" | "UPI";
export const PAYMENT_METHODS: PaymentMethod[] = ["Cash", "UPI"];

export interface PurchaseTransaction {
  id: string;
  type: "purchase";
  customerId: string;
  createdAt: string; // ISO
  lines: PurchaseLine[];
  total: number;
  note?: string;
}

export interface PaymentTransaction {
  id: string;
  type: "payment";
  customerId: string;
  createdAt: string; // ISO
  amount: number;
  method: PaymentMethod;
  note?: string;
}

export type Transaction = PurchaseTransaction | PaymentTransaction;

export type Session =
  | { role: "owner" }
  | { role: "customer"; customerId: string }
  | null;
