"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { useApp } from "@/context/store";

export default function OwnerLayout({ children }: { children: ReactNode }) {
  const { session } = useApp();
  const router = useRouter();
  const allowed = session?.role === "owner";

  useEffect(() => {
    if (!allowed) router.replace("/owner/login");
  }, [allowed, router]);

  if (!allowed) return null;
  return <OwnerShell>{children}</OwnerShell>;
}
