"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { CustomerShell } from "@/components/customer/CustomerShell";
import { useApp } from "@/context/store";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  const { session, currentCustomer } = useApp();
  const router = useRouter();
  const allowed = session?.role === "customer" && currentCustomer !== null;

  useEffect(() => {
    if (!allowed) router.replace("/customer/login");
  }, [allowed, router]);

  if (!allowed) return null;
  return <CustomerShell>{children}</CustomerShell>;
}
