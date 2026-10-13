# Chai Khata — Digital Tea Stall Ledger

A responsive frontend demo for managing an Indian tea stall's customers, product prices, purchases and credit ledgers.
Built with Next.js 14 (App Router), TypeScript, Tailwind CSS and Lucide React.

> **Frontend only.** Authentication is **simulated**. There is no backend, database, API call or environment variable
> needed by the app. All data lives in React state and resets when you reload the page.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run build      # static export into ./out
```

Requires Node 18.17+.

## Host on GitHub Pages (upload through the browser)

The site is a static export, and a GitHub Actions workflow builds and publishes it for you.

1. Create a new GitHub repository (public, or private on a plan that supports Pages).
2. Unzip this project. Open the repository, choose **Add file → Upload files**, and drag in the **contents** of the
   folder (not `node_modules`, which is not included anyway). GitHub's browser upload accepts up to 100 files at a time.
   - The workflow lives in a hidden folder, `.github/workflows/deploy.yml`. If your file manager hides it
     (macOS: press `Cmd + Shift + .` in Finder), you can instead use **Add file → Create new file**, type
     `.github/workflows/deploy.yml` as the name, and paste in the file's contents.
3. Commit to the `main` branch.
4. In the repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
5. Open the **Actions** tab and wait for "Deploy to GitHub Pages" to finish (about 1–2 minutes).
   Your site will be at `https://<your-username>.github.io/<repository-name>/`.

Every later commit to `main` redeploys automatically. The base path is worked out from the repository name, so no
configuration is needed. A repository named `<your-username>.github.io` is served from the root.

## Demo credentials

| Role     | Sign in with                                  |
| -------- | --------------------------------------------- |
| Owner    | `owner@chaikhata.demo` / `chai123`            |
| Customer | `9876543210` / `raj9876` (Rajesh Kumar)       |

More customer accounts are listed on the customer sign-in screen. Both login screens also have one-tap demo buttons.

Customers added by the owner can sign in straight away with their generated password.
**Initial password rule:** first 3 letters of the first name (lowercase) + first 4 digits of the mobile number,
e.g. Ravi Teja / 9000012345 → `rav9000`.

## What's inside

**Owner** (`/owner`)
- Dashboard: today's sales, total customers, outstanding dues, collected today, 7-day sales chart, highest dues, recent transactions
- Customers: add, edit, search by name or mobile, sort and filter, reset password, view ledger
- Products: add products, set and edit prices, mark unavailable
- New purchase: pick a customer, tap items, see the balance before and after
- Payments: record payments (Cash/UPI), outstanding balances, recent payments
- Customer ledger: itemised history with running balance, type and date filters
- Transactions: everything across customers, with search and filters

**Customer** (`/customer`)
- Balance summary: total purchases, total payments, outstanding
- Itemised timeline: product, quantity, unit price, line total, date and time, with date filters
- Profile and change-password screens (in-memory only)

## Behaviour notes

- Each purchase line stores a **snapshot** of the product name and unit price, so changing a price never rewrites past bills.
- Outstanding = total purchases − total payments. A negative value is shown as an advance.
- Currency is INR (₹, Indian digit grouping). Dates are `DD MMM YYYY`, times are 12-hour with AM/PM, all in Asia/Kolkata.
- Seed data is generated relative to today (30 days of history), so the dashboard always has current-looking activity.

## Project structure

```
src/
  app/                 routes (owner/, customer/, login screens)
  components/          shared UI, modals, shells, transaction timeline
  context/store.tsx    in-memory store and actions
  lib/                 types, seed data, ledger maths, formatting, validation
.github/workflows/     GitHub Pages deploy workflow
```
