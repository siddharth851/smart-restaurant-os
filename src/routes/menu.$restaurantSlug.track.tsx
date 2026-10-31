import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { 
  ArrowLeft, 
  Check, 
  ChefHat, 
  ClipboardCheck, 
  Loader2, 
  ShoppingBag, 
  ThumbsUp, 
  UtensilsCrossed, 
  Copy, 
  CheckCheck, 
  PlusCircle,
  Radio,
  Clock
} from "lucide-react";
import { useState } from "react";
import { formatINR } from "@/lib/demo-data";
import { useCart } from "@/lib/cart";
import { ORDER_FLOW, trackOrderQuery } from "@/lib/orders-api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/menu/$restaurantSlug/track")({
  validateSearch: z.object({ order: z.string().max(20).optional() }),
  component: TrackPage,
});

const steps = [
  { label: "Order received", desc: "The restaurant received your ticket", icon: ClipboardCheck },
  { label: "Accepted", desc: "Kitchen confirmed and queued your order", icon: ThumbsUp },
  { label: "Preparing", desc: "Our chefs are cooking your fresh meal", icon: ChefHat },
  { label: "Ready", desc: "Plated and heading to your table", icon: UtensilsCrossed },
  { label: "Served", desc: "Delivered to your table. Enjoy your feast!", icon: Check },
];

function TrackPage() {
  const { restaurantSlug } = Route.useParams();
  const { order } = Route.useSearch();
  const { lastOrder } = useCart();
  const code = order ?? lastOrder?.code ?? "";
  const { data: o, isLoading, isError } = useQuery(trackOrderQuery(code));
  const [copied, setCopied] = useState(false);

  const copyCode = (codeStr: string) => {
    navigator.clipboard.writeText(codeStr);
    setCopied(true);
    toast.success("Order code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const header = (
    <header className="sticky top-0 z-20 -mx-4 border-b border-border/70 bg-background/95 px-4 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            to="/menu/$restaurantSlug" 
            params={{ restaurantSlug }} 
            className="grid h-10 w-10 place-items-center rounded-xl border border-border/80 bg-card text-foreground transition-all hover:bg-muted" 
            aria-label="Back to menu"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-base font-extrabold text-foreground font-display sm:text-lg">Live Order Status</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Real-time kitchen tracking
            </p>
          </div>
        </div>
        <Link
          to="/menu/$restaurantSlug"
          params={{ restaurantSlug }}
          className="flex items-center gap-1.5 text-xs font-bold text-forest bg-forest/10 hover:bg-forest/20 px-3 py-1.5 rounded-xl transition-all"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span>Add More</span>
        </Link>
      </div>
    </header>
  );

  if (!code || (!isLoading && !o))
    return (
      <div className="min-h-screen bg-background px-4 pb-12">
        {header}
        <div className="mx-auto max-w-md py-24 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-muted text-muted-foreground">
            <ShoppingBag className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <p className="mt-4 font-display text-lg font-bold text-foreground">
            {isError ? "Couldn't load your order" : "No active order found"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Please verify your order code or start a fresh order from the menu.
          </p>
          <Link 
            to="/menu/$restaurantSlug" 
            params={{ restaurantSlug }} 
            className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-forest px-6 text-sm font-bold text-forest-foreground shadow-soft transition-all hover:bg-forest/90"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );

  if (!o)
    return (
      <div className="min-h-screen bg-background px-4">
        {header}
        <div className="grid place-items-center py-28 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-forest" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">Locating your kitchen ticket…</p>
        </div>
      </div>
    );

  const current = ORDER_FLOW.indexOf(o.status);

  return (
    <div className="min-h-screen bg-background px-4 pb-20">
      {header}

      <div className="mx-auto max-w-4xl pt-5 space-y-6">
        {/* Cinematic Order Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-forest p-6 text-forest-foreground shadow-elevated">
          {/* Subtle ambient blur glow */}
          <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
          
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-wide uppercase">
                Table {o.table}
              </span>
              <span className="text-xs text-forest-foreground/80 font-medium">
                {o.restaurantName}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-forest-foreground/80">
              <Clock className="h-3.5 w-3.5" />
              <span>{new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-forest-foreground/70 font-semibold">Order Reference</p>
              <div className="mt-1 flex items-center gap-3">
                <p className="font-mono text-3xl font-extrabold tracking-tight sm:text-4xl" data-testid="order-code">
                  {o.code}
                </p>
                <button
                  onClick={() => copyCode(o.code)}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-forest-foreground hover:bg-white/20 transition-colors"
                  aria-label="Copy order code"
                >
                  {copied ? <CheckCheck className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-forest-foreground/85">
                Prepared for <span className="font-bold">{o.customerName}</span>
              </p>
            </div>

            <div 
              className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2 backdrop-blur-sm border border-white/10" 
              data-testid="order-status"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
              </span>
              <span className="text-sm font-extrabold">{steps[current]?.label || o.status}</span>
            </div>
          </div>
        </div>

        {/* Live Stepper & Items Breakdown */}
        <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-6 space-y-6 lg:space-y-0">
          {/* Timeline */}
          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between border-b border-border/50 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 text-forest" /> Live Progress
              </h2>
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                Step {Math.min(current + 1, steps.length)} of {steps.length}
              </span>
            </div>

            <ol className="space-y-2" aria-label="Order progress">
              {steps.map((s, i) => {
                const done = i < current || (i === current && i === steps.length - 1);
                const active = i === current && !done;

                return (
                  <li key={s.label} className="relative flex gap-4 pb-6 last:pb-0" aria-current={i === current ? "step" : undefined}>
                    {i < steps.length - 1 && (
                      <span 
                        className={cn(
                          "absolute left-5 top-11 h-[calc(100%-2.5rem)] w-0.5 transition-colors", 
                          i < current ? "bg-forest" : "bg-border/60"
                        )} 
                      />
                    )}
                    <div 
                      className={cn(
                        "grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-all shadow-xs", 
                        done 
                          ? "bg-forest text-forest-foreground" 
                          : active 
                          ? "bg-forest/15 text-forest ring-2 ring-forest" 
                          : "bg-muted text-muted-foreground/60"
                      )}
                    >
                      <s.icon className={cn("h-4.5 w-4.5", active && "animate-pulse")} />
                    </div>
                    <div className="pt-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={cn("text-sm font-bold", !done && !active ? "text-muted-foreground" : "text-foreground")}>
                          {s.label}
                        </p>
                        {active && (
                          <span className="rounded-md bg-forest/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-forest">
                            In Progress
                          </span>
                        )}
                        {done && (
                          <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            Completed
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Items Summary */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-card p-5 text-sm shadow-soft">
              <div className="mb-3 flex items-center justify-between border-b border-border/50 pb-2.5">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Order Items</p>
                <span className="text-xs font-medium text-muted-foreground">
                  {o.items.reduce((acc, item) => acc + item.qty, 0)} items
                </span>
              </div>

              <div className="space-y-2.5 divide-y divide-border/40">
                {o.items.map((l, i) => (
                  <div key={i} className="flex justify-between gap-3 pt-2.5 first:pt-0">
                    <span className="min-w-0 text-foreground font-medium">
                      <span className="font-extrabold text-forest">{l.qty} ×</span> {l.name}
                    </span>
                    <span className="shrink-0 font-bold text-foreground">
                      {formatINR(l.qty * l.price)}
                    </span>
                  </div>
                ))}
              </div>

              {o.notes && (
                <div className="mt-3.5 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground border border-border/50">
                  <p className="font-bold text-foreground mb-0.5">Kitchen Note:</p>
                  <p>{o.notes}</p>
                </div>
              )}

              <div className="mt-4 flex justify-between border-t border-border/70 pt-3 font-display text-base font-extrabold text-foreground">
                <span>Total Amount</span>
                <span className="text-forest">{formatINR(o.total)}</span>
              </div>
            </div>

            <Link 
              to="/menu/$restaurantSlug" 
              params={{ restaurantSlug }} 
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-forest/10 font-bold text-sm text-forest transition-all hover:bg-forest/20"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Order More Items</span>
            </Link>

            <p className="text-center text-xs text-muted-foreground">
              This screen updates live via kitchen websocket & polling.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
