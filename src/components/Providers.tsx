"use client";

import type { ReactNode } from "react";
import { AppProvider, useApp } from "@/context/store";
import { Logo } from "@/components/ui/Primitives";
import { ToastProvider } from "@/components/ui/Toast";

function ReadyGate({ children }: { children: ReactNode }) {
  const { ready } = useApp();
  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="animate-pulse">
          <Logo subtitle={false} />
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <ToastProvider>
        <ReadyGate>{children}</ReadyGate>
      </ToastProvider>
    </AppProvider>
  );
}
