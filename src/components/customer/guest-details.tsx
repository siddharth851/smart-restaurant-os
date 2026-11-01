import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { User, Hash } from "lucide-react";

/** Customer name + table number (no login). Values live in the cart context. */
export function GuestDetails({
  errors,
  className,
}: {
  errors?: { customerName?: string | undefined; table?: string | undefined };
  className?: string;
}) {
  const cart = useCart();
  return (
    <div className={cn("grid grid-cols-[1fr_7.5rem] gap-3", className)}>
      <label className="min-w-0 text-xs font-semibold text-foreground/80">
        <span className="mb-1.5 flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-muted-foreground" /> Your Name
        </span>
        <input
          value={cart.customerName}
          onChange={(e) => cart.setCustomerName(e.target.value.slice(0, 60))}
          placeholder="e.g. Priya"
          autoComplete="given-name"
          aria-invalid={!!errors?.customerName}
          className={cn(
            "h-11 w-full rounded-xl border border-border/70 bg-card px-3.5 text-sm font-medium text-foreground transition-all placeholder:text-muted-foreground/60 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20 shadow-xs",
            errors?.customerName && "border-destructive focus:ring-destructive/20",
          )}
        />
        {errors?.customerName && (
          <span className="mt-1 block text-xs font-medium text-destructive">
            {errors.customerName}
          </span>
        )}
      </label>
      <label className="text-xs font-semibold text-foreground/80">
        <span className="mb-1.5 flex items-center gap-1.5">
          <Hash className="h-3.5 w-3.5 text-muted-foreground" /> Table No.
        </span>
        <input
          value={cart.table ?? ""}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 3);
            cart.setTable(v ? Number(v) : null);
          }}
          placeholder="4"
          inputMode="numeric"
          aria-invalid={!!errors?.table}
          className={cn(
            "h-11 w-full rounded-xl border border-border/70 bg-card px-3.5 text-sm font-medium text-foreground transition-all placeholder:text-muted-foreground/60 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20 shadow-xs text-center sm:text-left",
            errors?.table && "border-destructive focus:ring-destructive/20",
          )}
        />
        {errors?.table && (
          <span className="mt-1 block text-xs font-medium text-destructive">{errors.table}</span>
        )}
      </label>
    </div>
  );
}
