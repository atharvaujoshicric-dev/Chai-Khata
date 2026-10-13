import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo, SimulatedNotice } from "@/components/ui/Primitives";

export function AuthShell({
  heading,
  subheading,
  panelTitle,
  panelText,
  children,
}: {
  heading: string;
  subheading: string;
  panelTitle: string;
  panelText: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-chai-900 p-12 text-cream-50 lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-saffron-500/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-chai-500/30 blur-3xl"
        />
        <div className="relative">
          <Logo tone="light" />
        </div>
        <div className="relative max-w-md">
          <h2 className="font-display text-4xl font-semibold leading-tight">
            {panelTitle}
          </h2>
          <p className="mt-4 text-lg text-chai-200">{panelText}</p>
        </div>
        <p className="relative text-sm text-chai-300">
          Chai Khata · Frontend demo with local sample data
        </p>
      </aside>

      <main className="flex flex-col px-5 pb-10 pt-6 sm:px-10">
        <div className="flex items-center justify-between">
          <div className="lg:hidden">
            <Logo subtitle={false} />
          </div>
          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-chai-600 hover:bg-chai-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
          <h1 className="font-display text-3xl font-semibold text-chai-800">
            {heading}
          </h1>
          <p className="mt-2 text-charcoal-500">{subheading}</p>
          <div className="mt-6">{children}</div>
          <SimulatedNotice className="mt-6" />
        </div>
      </main>
    </div>
  );
}
