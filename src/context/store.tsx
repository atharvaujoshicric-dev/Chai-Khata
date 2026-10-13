"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { round2 } from "@/lib/format";
import { uid } from "@/lib/ids";
import { linesTotal } from "@/lib/ledger";
import { createSeed } from "@/lib/seed";
import type {
  Customer,
  PaymentMethod,
  PaymentTransaction,
  Product,
  ProductCategory,
  PurchaseLine,
  PurchaseTransaction,
  Session,
  Transaction,
} from "@/lib/types";
import {
  generateInitialPassword,
  isValidMobile,
  normalizeMobile,
} from "@/lib/validation";

/** Demo owner credentials. Authentication in this app is SIMULATED. */
export const DEMO_OWNER = {
  email: "owner@chaikhata.demo",
  password: "chai123",
};

const SESSION_KEY = "chai-khata:simulated-session";

export type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

export interface CustomerInput {
  name: string;
  mobile: string;
  locality: string;
}

export interface ProductInput {
  name: string;
  category: ProductCategory;
  price: number;
  active?: boolean;
}

export interface PurchaseInput {
  customerId: string;
  items: { productId: string; quantity: number }[];
  note?: string;
}

export interface PaymentInput {
  customerId: string;
  amount: number;
  method: PaymentMethod;
  note?: string;
}

interface AppContextValue {
  ready: boolean;
  session: Session;
  customers: Customer[];
  products: Product[];
  transactions: Transaction[];
  currentCustomer: Customer | null;

  loginOwner: (email: string, password: string) => boolean;
  loginCustomer: (mobile: string, password: string) => Result<{ customer: Customer }>;
  logout: () => void;

  addCustomer: (
    input: CustomerInput
  ) => Result<{ customer: Customer; initialPassword: string }>;
  updateCustomer: (id: string, input: CustomerInput) => Result<{ customer: Customer }>;
  resetPassword: (id: string) => string | null;
  changePassword: (
    customerId: string,
    current: string,
    next: string
  ) => Result;

  addProduct: (input: ProductInput) => Result<{ product: Product }>;
  updateProduct: (id: string, input: ProductInput) => Result<{ product: Product }>;

  addPurchase: (
    input: PurchaseInput
  ) => Result<{ transaction: PurchaseTransaction }>;
  addPayment: (
    input: PaymentInput
  ) => Result<{ transaction: PaymentTransaction }>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Seed demo data on the client only (it is relative to the current time).
  useEffect(() => {
    const seed = createSeed(new Date());
    setCustomers(seed.customers);
    setProducts(seed.products);
    setTransactions(seed.transactions);
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Session;
        if (saved?.role === "owner") setSession(saved);
        else if (
          saved?.role === "customer" &&
          seed.customers.some((c) => c.id === saved.customerId)
        )
          setSession(saved);
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      else sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, [session, ready]);

  const currentCustomer =
    session?.role === "customer"
      ? customers.find((c) => c.id === session.customerId) ?? null
      : null;

  const value: AppContextValue = {
    ready,
    session,
    customers,
    products,
    transactions,
    currentCustomer,

    loginOwner(email, password) {
      const ok =
        email.trim().toLowerCase() === DEMO_OWNER.email &&
        password === DEMO_OWNER.password;
      if (ok) setSession({ role: "owner" });
      return ok;
    },

    loginCustomer(mobile, password) {
      const m = normalizeMobile(mobile);
      const customer = customers.find((c) => c.mobile === m);
      if (!customer || customer.password !== password) {
        return { ok: false, error: "Mobile number or password is incorrect." };
      }
      setSession({ role: "customer", customerId: customer.id });
      return { ok: true, customer };
    },

    logout() {
      setSession(null);
    },

    addCustomer(input) {
      const name = input.name.trim().replace(/\s+/g, " ");
      const mobile = normalizeMobile(input.mobile);
      if (name.length < 2) return { ok: false, error: "Enter the customer's name." };
      if (!isValidMobile(mobile))
        return { ok: false, error: "Enter a valid 10-digit mobile number." };
      if (customers.some((c) => c.mobile === mobile))
        return { ok: false, error: "A customer with this mobile number already exists." };
      const initialPassword = generateInitialPassword(name, mobile);
      const customer: Customer = {
        id: uid("c"),
        name,
        mobile,
        locality: input.locality.trim(),
        joinedAt: new Date().toISOString(),
        password: initialPassword,
      };
      setCustomers((prev) => [customer, ...prev]);
      return { ok: true, customer, initialPassword };
    },

    updateCustomer(id, input) {
      const name = input.name.trim().replace(/\s+/g, " ");
      const mobile = normalizeMobile(input.mobile);
      const existing = customers.find((c) => c.id === id);
      if (!existing) return { ok: false, error: "Customer not found." };
      if (name.length < 2) return { ok: false, error: "Enter the customer's name." };
      if (!isValidMobile(mobile))
        return { ok: false, error: "Enter a valid 10-digit mobile number." };
      if (customers.some((c) => c.id !== id && c.mobile === mobile))
        return { ok: false, error: "Another customer already uses this mobile number." };
      const customer: Customer = {
        ...existing,
        name,
        mobile,
        locality: input.locality.trim(),
      };
      setCustomers((prev) => prev.map((c) => (c.id === id ? customer : c)));
      return { ok: true, customer };
    },

    resetPassword(id) {
      const existing = customers.find((c) => c.id === id);
      if (!existing) return null;
      const password = generateInitialPassword(existing.name, existing.mobile);
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, password } : c))
      );
      return password;
    },

    changePassword(customerId, current, next) {
      const existing = customers.find((c) => c.id === customerId);
      if (!existing) return { ok: false, error: "Account not found." };
      if (existing.password !== current)
        return { ok: false, error: "Current password is incorrect." };
      if (next.length < 6)
        return { ok: false, error: "New password must be at least 6 characters." };
      if (next === current)
        return { ok: false, error: "New password must be different from the current one." };
      setCustomers((prev) =>
        prev.map((c) => (c.id === customerId ? { ...c, password: next } : c))
      );
      return { ok: true };
    },

    addProduct(input) {
      const name = input.name.trim().replace(/\s+/g, " ");
      if (name.length < 2) return { ok: false, error: "Enter the product name." };
      if (!(input.price > 0) || input.price > 100000)
        return { ok: false, error: "Enter a valid price greater than ₹0." };
      if (products.some((p) => p.name.toLowerCase() === name.toLowerCase()))
        return { ok: false, error: "A product with this name already exists." };
      const product: Product = {
        id: uid("p"),
        name,
        category: input.category,
        price: round2(input.price),
        active: input.active ?? true,
        priceUpdatedAt: new Date().toISOString(),
      };
      setProducts((prev) => [product, ...prev]);
      return { ok: true, product };
    },

    updateProduct(id, input) {
      const existing = products.find((p) => p.id === id);
      if (!existing) return { ok: false, error: "Product not found." };
      const name = input.name.trim().replace(/\s+/g, " ");
      if (name.length < 2) return { ok: false, error: "Enter the product name." };
      if (!(input.price > 0) || input.price > 100000)
        return { ok: false, error: "Enter a valid price greater than ₹0." };
      if (
        products.some(
          (p) => p.id !== id && p.name.toLowerCase() === name.toLowerCase()
        )
      )
        return { ok: false, error: "Another product already has this name." };
      const price = round2(input.price);
      // Only the product changes. Existing transactions keep the unit price
      // and name they were billed with.
      const product: Product = {
        ...existing,
        name,
        category: input.category,
        price,
        active: input.active ?? existing.active,
        priceUpdatedAt:
          price !== existing.price
            ? new Date().toISOString()
            : existing.priceUpdatedAt,
      };
      setProducts((prev) => prev.map((p) => (p.id === id ? product : p)));
      return { ok: true, product };
    },

    addPurchase(input) {
      if (!customers.some((c) => c.id === input.customerId))
        return { ok: false, error: "Select a customer." };
      const lines: PurchaseLine[] = [];
      for (const item of input.items) {
        if (!Number.isInteger(item.quantity) || item.quantity < 1) continue;
        const product = products.find((p) => p.id === item.productId);
        if (!product) continue;
        lines.push({
          productId: product.id,
          name: product.name,
          quantity: item.quantity,
          unitPrice: product.price, // snapshot of the price right now
        });
      }
      if (lines.length === 0)
        return { ok: false, error: "Add at least one item to the bill." };
      const transaction: PurchaseTransaction = {
        id: uid("tx"),
        type: "purchase",
        customerId: input.customerId,
        createdAt: new Date().toISOString(),
        lines,
        total: linesTotal(lines),
        note: input.note?.trim() || undefined,
      };
      setTransactions((prev) => [transaction, ...prev]);
      return { ok: true, transaction };
    },

    addPayment(input) {
      if (!customers.some((c) => c.id === input.customerId))
        return { ok: false, error: "Select a customer." };
      const amount = round2(input.amount);
      if (!(amount > 0) || amount > 10_000_000)
        return { ok: false, error: "Enter a valid amount greater than ₹0." };
      const transaction: PaymentTransaction = {
        id: uid("tx"),
        type: "payment",
        customerId: input.customerId,
        createdAt: new Date().toISOString(),
        amount,
        method: input.method,
        note: input.note?.trim() || undefined,
      };
      setTransactions((prev) => [transaction, ...prev]);
      return { ok: true, transaction };
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
