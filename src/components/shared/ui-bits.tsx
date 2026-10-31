import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string | undefined;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-stone-200/60 pb-5">
      <div className="min-w-0">
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-xs sm:text-sm text-stone-500 leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-3xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-xs", className)}>
      {title && (
        <div className="mb-5 flex items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <h2 className="font-display text-base font-bold text-stone-900">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta?: string;
  icon: LucideIcon;
}) {
  const isPositive = delta?.startsWith("+");
  const isNegative = delta?.startsWith("-");

  return (
    <div className="relative overflow-hidden rounded-3xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-xs transition-all duration-200 hover:shadow-md hover:border-stone-300">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">{label}</p>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-xs">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
        {value}
      </p>
      {delta && (
        <div className="mt-2 flex items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full",
              isPositive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                : isNegative
                  ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                  : "bg-stone-100 text-stone-600",
            )}
          >
            {delta}
          </span>
          <span className="text-[11px] text-stone-400">vs yesterday</span>
        </div>
      )}
    </div>
  );
}

const statusThemes: Record<string, { bg: string; text: string; dot: string }> = {
  new: { bg: "bg-blue-50 border-blue-200/80", text: "text-blue-700", dot: "bg-blue-500" },
  received: { bg: "bg-blue-50 border-blue-200/80", text: "text-blue-700", dot: "bg-blue-500" },
  accepted: { bg: "bg-indigo-50 border-indigo-200/80", text: "text-indigo-700", dot: "bg-indigo-500" },
  preparing: { bg: "bg-amber-50 border-amber-200/80", text: "text-amber-800", dot: "bg-amber-500 animate-pulse" },
  ready: { bg: "bg-emerald-50 border-emerald-200/80", text: "text-emerald-700", dot: "bg-emerald-500" },
  served: { bg: "bg-stone-100 border-stone-200", text: "text-stone-600", dot: "bg-stone-400" },
  available: { bg: "bg-emerald-50 border-emerald-200/80", text: "text-emerald-700", dot: "bg-emerald-500" },
  occupied: { bg: "bg-amber-50 border-amber-200/80", text: "text-amber-800", dot: "bg-amber-500" },
  reserved: { bg: "bg-purple-50 border-purple-200/80", text: "text-purple-700", dot: "bg-purple-500" },
  active: { bg: "bg-emerald-50 border-emerald-200/80", text: "text-emerald-700", dot: "bg-emerald-500" },
  trial: { bg: "bg-sky-50 border-sky-200/80", text: "text-sky-700", dot: "bg-sky-500" },
  suspended: { bg: "bg-rose-50 border-rose-200/80", text: "text-rose-700", dot: "bg-rose-500" },
  "on leave": { bg: "bg-stone-100 border-stone-200", text: "text-stone-600", dot: "bg-stone-400" },
};

export function StatusBadge({ status }: { status: string }) {
  const norm = status.toLowerCase();
  const theme = statusThemes[norm] ?? {
    bg: "bg-stone-100 border-stone-200",
    text: "text-stone-600",
    dot: "bg-stone-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize shadow-2xs",
        theme.bg,
        theme.text,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", theme.dot)} />
      {status}
    </span>
  );
}

export function VegMark({ veg }: { veg: boolean }) {
  return (
    <span
      className={cn(
        "grid h-4 w-4 shrink-0 place-items-center rounded-xs border-[1.5px]",
        veg ? "border-emerald-600 bg-white" : "border-rose-600 bg-white",
      )}
      aria-label={veg ? "Vegetarian" : "Non-vegetarian"}
      title={veg ? "Vegetarian" : "Non-vegetarian"}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", veg ? "bg-emerald-600" : "bg-rose-600")} />
    </span>
  );
}

export function SimpleTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="-mx-5 -mb-5 overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm text-left">
        <thead>
          <tr className="border-b border-stone-200 bg-stone-50/70 text-xs uppercase tracking-wider font-bold text-stone-500">
            {head.map((h) => (
              <th key={h} className="px-6 py-3.5">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {rows.map((r, i) => (
            <tr key={i} className="transition-colors hover:bg-stone-50/80">
              {r.map((c, j) => (
                <td key={j} className="px-6 py-4 text-stone-700">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex h-52 items-end gap-2 sm:gap-4 pt-4">
      {data.map((d) => {
        const pct = Math.max(8, (d.value / max) * 100);
        return (
          <div key={d.label} className="group flex flex-1 flex-col items-center gap-2">
            <div className="relative flex h-40 w-full items-end justify-center">
              {/* Tooltip on Hover */}
              <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
                ₹{d.value.toLocaleString()}
              </div>
              <div
                className="w-full max-w-10 rounded-t-xl bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:from-emerald-500 group-hover:to-emerald-300 transition-all shadow-xs"
                style={{ height: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-stone-500 group-hover:text-stone-900 transition-colors">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
