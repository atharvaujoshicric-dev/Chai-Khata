import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-saffron-600 text-white shadow-sm hover:bg-saffron-700 active:bg-saffron-700 focus-visible:ring-saffron-500",
  secondary:
    "border border-chai-200 bg-cream-50 text-chai-700 hover:bg-cream-200 active:bg-cream-200 focus-visible:ring-chai-300",
  ghost:
    "text-chai-600 hover:bg-chai-50 active:bg-chai-100 focus-visible:ring-chai-300",
  danger:
    "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-700 focus-visible:ring-rose-400",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 rounded-lg px-3 text-sm",
  md: "h-11 gap-2 rounded-xl px-4 text-[15px]",
  lg: "h-12 gap-2 rounded-xl px-5 text-base",
};

export function buttonClass({
  variant = "primary",
  size = "md",
  full = false,
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  className?: string;
} = {}): string {
  return [
    "inline-flex shrink-0 items-center justify-center font-semibold transition-colors",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-100",
    "disabled:cursor-not-allowed disabled:opacity-50",
    variants[variant],
    sizes[size],
    full ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  variant,
  size,
  full,
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
}) {
  return (
    <button
      type={type}
      className={buttonClass({ variant, size, full, className })}
      {...props}
    />
  );
}
