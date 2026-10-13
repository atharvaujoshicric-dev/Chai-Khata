"use client";

export function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex flex-wrap gap-2"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`h-9 rounded-full border px-3.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron-500 ${
              active
                ? "border-saffron-500 bg-saffron-500 text-white"
                : "border-chai-200 bg-cream-50 text-chai-600 hover:bg-chai-50"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
