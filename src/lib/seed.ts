import {
  istDateKey,
  istMinutesOfDay,
  istStartOfDay,
  round2,
} from "./format";
import { uid } from "./ids";
import type {
  Customer,
  PaymentTransaction,
  Product,
  PurchaseLine,
  PurchaseTransaction,
  Transaction,
} from "./types";
import { generateInitialPassword } from "./validation";

/** Deterministic PRNG so the demo data looks the same on every load. */
function mulberry32(seed: number) {
  let a = seed;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface ProductSeed {
  id: string;
  name: string;
  category: Product["category"];
  price: number;
  /** If set, sales older than `changedDaysAgo` were billed at this price. */
  oldPrice?: number;
  changedDaysAgo?: number;
}

const PRODUCT_SEEDS: ProductSeed[] = [
  { id: "p-cutting", name: "Cutting Chai", category: "Tea", price: 8 },
  {
    id: "p-masala",
    name: "Masala Chai",
    category: "Tea",
    price: 12,
    oldPrice: 10,
    changedDaysAgo: 12,
  },
  { id: "p-ginger", name: "Adrak Chai", category: "Tea", price: 12 },
  { id: "p-coffee", name: "Filter Coffee", category: "Coffee", price: 15 },
  { id: "p-bun", name: "Bun Maska", category: "Snacks", price: 25 },
  {
    id: "p-samosa",
    name: "Samosa",
    category: "Snacks",
    price: 15,
    oldPrice: 12,
    changedDaysAgo: 20,
  },
  { id: "p-vadapav", name: "Vada Pav", category: "Snacks", price: 20 },
  { id: "p-maggi", name: "Hot Maggi", category: "Snacks", price: 30 },
  { id: "p-parle", name: "Parle-G Biscuits", category: "Biscuits", price: 10 },
  {
    id: "p-cig",
    name: "Cigarette (single)",
    category: "Cigarettes",
    price: 18,
    oldPrice: 17,
    changedDaysAgo: 6,
  },
];

interface CustomerSeed {
  name: string;
  mobile: string;
  locality: string;
  joinedDaysAgo: number;
  visit: number; // probability of visiting on a given day
  pay: number; // probability of paying something on a given day
  favs: string[];
  settleOn?: number; // day offset on which the customer clears the entire due
}

const CUSTOMER_SEEDS: CustomerSeed[] = [
  {
    name: "Rajesh Kumar",
    mobile: "9876543210",
    locality: "Shivaji Nagar",
    joinedDaysAgo: 240,
    visit: 0.9,
    pay: 0.1,
    favs: ["p-masala", "p-bun", "p-cig"],
  },
  {
    name: "Priya Sharma",
    mobile: "9812345678",
    locality: "Gandhi Chowk",
    joinedDaysAgo: 180,
    visit: 0.55,
    pay: 0.14,
    favs: ["p-ginger", "p-parle", "p-coffee"],
  },
  {
    name: "Amit Verma",
    mobile: "9988776655",
    locality: "Station Road",
    joinedDaysAgo: 150,
    visit: 0.8,
    pay: 0.09,
    favs: ["p-cutting", "p-samosa", "p-cig"],
  },
  {
    name: "Sunita Devi",
    mobile: "9123456780",
    locality: "Old Bazaar",
    joinedDaysAgo: 320,
    visit: 0.4,
    pay: 0.08,
    favs: ["p-masala", "p-parle"],
    settleOn: 2,
  },
  {
    name: "Mohammed Irfan",
    mobile: "9001122334",
    locality: "Mochi Gali",
    joinedDaysAgo: 120,
    visit: 0.7,
    pay: 0.12,
    favs: ["p-cutting", "p-vadapav", "p-maggi"],
  },
  {
    name: "Anjali Singh",
    mobile: "8899001122",
    locality: "College Road",
    joinedDaysAgo: 75,
    visit: 0.6,
    pay: 0.15,
    favs: ["p-coffee", "p-bun", "p-maggi"],
  },
  {
    name: "Vikram Yadav",
    mobile: "7007654321",
    locality: "Transport Nagar",
    joinedDaysAgo: 210,
    visit: 0.85,
    pay: 0.07,
    favs: ["p-masala", "p-samosa", "p-cig"],
  },
  {
    name: "Lakshmi Iyer",
    mobile: "9445566778",
    locality: "Temple Street",
    joinedDaysAgo: 90,
    visit: 0.5,
    pay: 0.2,
    favs: ["p-coffee", "p-parle"],
  },
  {
    name: "Deepak Mishra",
    mobile: "9654321870",
    locality: "Bus Stand",
    joinedDaysAgo: 45,
    visit: 0.65,
    pay: 0.1,
    favs: ["p-ginger", "p-vadapav"],
  },
];

export interface SeedData {
  customers: Customer[];
  products: Product[];
  transactions: Transaction[];
}

const HISTORY_DAYS = 30;

export function createSeed(now: Date): SeedData {
  const rand = mulberry32(20261013);
  const todayKey = istDateKey(now);
  const nowMin = istMinutesOfDay(now);
  const dayStartMs = istStartOfDay(todayKey).getTime();
  const at = (dayOffset: number, minute: number) =>
    new Date(dayStartMs - dayOffset * 86_400_000 + minute * 60_000).toISOString();

  const products: Product[] = PRODUCT_SEEDS.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    active: true,
    priceUpdatedAt: at(p.changedDaysAgo ?? 45, 600),
  }));
  const productSeedById = new Map(PRODUCT_SEEDS.map((p) => [p.id, p]));

  const customers: Customer[] = CUSTOMER_SEEDS.map((c, i) => ({
    id: `c${i + 1}`,
    name: c.name,
    mobile: c.mobile,
    locality: c.locality,
    joinedAt: at(c.joinedDaysAgo, 660),
    password: generateInitialPassword(c.name, c.mobile),
  }));

  const transactions: Transaction[] = [];
  const owed = new Map<string, number>(customers.map((c) => [c.id, 0]));

  const pickLines = (favs: string[], dayOffset: number): PurchaseLine[] => {
    const count = Math.min(
      favs.length,
      1 + (rand() < 0.5 ? 1 : 0) + (rand() < 0.15 ? 1 : 0)
    );
    const pool = [...favs];
    const lines: PurchaseLine[] = [];
    for (let k = 0; k < count; k++) {
      const idx = Math.floor(rand() * pool.length);
      const id = pool.splice(idx, 1)[0];
      const seed = productSeedById.get(id)!;
      const unitPrice =
        seed.oldPrice !== undefined &&
        seed.changedDaysAgo !== undefined &&
        dayOffset > seed.changedDaysAgo
          ? seed.oldPrice
          : seed.price;
      lines.push({
        productId: id,
        name: seed.name,
        quantity: 1 + Math.floor(rand() * 3),
        unitPrice,
      });
    }
    return lines;
  };

  for (let d = HISTORY_DAYS - 1; d >= 0; d--) {
    customers.forEach((customer, i) => {
      const prof = CUSTOMER_SEEDS[i];
      let lastMinute = 0;

      if (rand() < prof.visit) {
        const visits = rand() < 0.3 ? 2 : 1;
        for (let v = 0; v < visits; v++) {
          const minute =
            v === 0
              ? 420 + Math.floor(rand() * 210) // 7:00 – 10:30 AM
              : 990 + Math.floor(rand() * 210); // 4:30 – 8:00 PM
          if (d === 0 && minute > nowMin - 5) continue;
          const lines = pickLines(prof.favs, d);
          const total = round2(
            lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0)
          );
          const tx: PurchaseTransaction = {
            id: uid("tx"),
            type: "purchase",
            customerId: customer.id,
            createdAt: at(d, minute),
            lines,
            total,
          };
          transactions.push(tx);
          owed.set(customer.id, round2((owed.get(customer.id) ?? 0) + total));
          lastMinute = Math.max(lastMinute, minute);
        }
      }

      const due = owed.get(customer.id) ?? 0;
      const settle = prof.settleOn === d;
      if (due >= 10 && (settle || rand() < prof.pay)) {
        const minute = Math.max(1230 + Math.floor(rand() * 30), lastMinute + 5);
        if (!(d === 0 && minute > nowMin - 5)) {
          const amount = settle
            ? due
            : Math.min(
                due,
                Math.max(10, Math.round((due * (0.5 + rand() * 0.5)) / 10) * 10)
              );
          const tx: PaymentTransaction = {
            id: uid("tx"),
            type: "payment",
            customerId: customer.id,
            createdAt: at(d, minute),
            amount,
            method: rand() < 0.55 ? "UPI" : "Cash",
          };
          transactions.push(tx);
          owed.set(customer.id, round2(due - amount));
        }
      }
    });
  }

  transactions.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return { customers, products, transactions };
}
