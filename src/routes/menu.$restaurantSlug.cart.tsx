import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Loader2, 
  Minus, 
  Plus, 
  ShoppingBag, 
  Trash2, 
  UtensilsCrossed, 
  Sparkles,
  Receipt,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { formatINR } from "@/lib/demo-data";
import { guestSchema, placeOrder } from "@/lib/restaurant-api";
import { GuestDetails } from "@/components/customer/guest-details";
import { useCart } from "@/lib/cart";
import { VegMark } from "@/components/shared/ui-bits";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/menu/$restaurantSlug/cart")({
  component: CartPage,
});

export function CartPage() {
  const { restaurantSlug } = Route.useParams();
  const cart = useCart();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<{ customerName?: string | undefined; table?: string | undefined }>({});

  const order = useMutation({
    mutationFn: placeOrder,
    onSuccess: (res, vars) => {
      cart.setLastOrder({ 
        code: res.code, 
        total: res.total, 
        createdAt: res.createdAt, 
        table: vars.table, 
        customerName: vars.customerName.trim(), 
        lines: cart.lines.map((l) => ({ name: l.item.name, qty: l.qty, price: l.item.price })) 
      });
      cart.clear();
      toast.success(`Order ${res.code} placed successfully!`);
      navigate({ to: "/menu/$restaurantSlug/track", params: { restaurantSlug }, search: { order: res.code } });
    },
    onError: (e: Error) => {
      toast.error(e.message || "Couldn't place your order. Please try again.");
      qc.invalidateQueries({ queryKey: ["public-menu", restaurantSlug] });
    },
  });

  const submit = () => {
    const parsed = guestSchema.safeParse({ customerName: cart.customerName, table: cart.table ?? undefined });
    if (!parsed.success) {
      const f = parsed.error.flatten().fieldErrors;
      setErrors({ customerName: f.customerName?.[0], table: f.table?.[0] });
      toast.error("Please provide your name and table number");
      return;
    }
    setErrors({});
    const unavailable = cart.lines.find((l) => !l.item.available);
    if (unavailable) { 
      toast.error(`${unavailable.item.name} is out of stock — remove it to continue`); 
      return; 
    }
    order.mutate({ 
      slug: restaurantSlug, 
      customerName: parsed.data.customerName, 
      table: parsed.data.table, 
      notes, 
      lines: cart.lines.map((l) => ({ id: l.item.id, qty: l.qty })) 
    });
  };

  const addPresetNote = (preset: string) => {
    setNotes((prev) => (prev ? `${prev}, ${preset}` : preset).slice(0, 300));
  };

  return (
    <div className="min-h-screen bg-background pb-44">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/95 px-4 backdrop-blur-md">
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
              <h1 className="text-base font-extrabold text-foreground font-display sm:text-lg">Review Order</h1>
              <p className="text-xs text-muted-foreground">{cart.count} {cart.count === 1 ? "item" : "items"} in cart</p>
            </div>
          </div>
          {cart.table && (
            <span className="rounded-lg bg-forest/10 px-2.5 py-1 text-xs font-bold text-forest">
              Table {cart.table}
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pt-4">
        {cart.count === 0 ? (
          <div className="py-24 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-muted text-muted-foreground">
              <ShoppingBag className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <p className="mt-4 font-display text-lg font-bold text-foreground">Your cart is empty</p>
            <p className="mt-1 text-xs text-muted-foreground">Add some delicious dishes from the menu to get started.</p>
            <Link 
              to="/menu/$restaurantSlug" 
              params={{ restaurantSlug }} 
              className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-forest px-6 text-sm font-bold text-forest-foreground shadow-soft transition-all hover:bg-forest/90"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-4 lg:grid lg:grid-cols-[1fr_360px] lg:gap-6 lg:space-y-0">
            {/* Left: Items list & Cooking instructions */}
            <div className="space-y-4">
              {/* Dining Info on Mobile (shows first) */}
              <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft lg:hidden">
                <div className="mb-3 flex items-center justify-between border-b border-border/50 pb-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Table & Guest</p>
                  <span className="text-[11px] text-muted-foreground">Required for order</span>
                </div>
                <GuestDetails errors={errors} className="grid-cols-[1fr_7.5rem]" />
              </div>

              <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
                <div className="mb-3 flex items-center justify-between border-b border-border/50 pb-2">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Order Items</h2>
                  <button 
                    onClick={() => cart.clear()} 
                    className="text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                <div className="divide-y divide-border/50">
                  {cart.lines.map(({ item, qty }) => (
                    <div key={item.id} className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          loading="lazy" 
                          width={100} 
                          height={100} 
                          className="h-16 w-16 shrink-0 rounded-xl object-cover ring-1 ring-border/50" 
                        />
                      ) : (
                        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-muted font-display font-bold text-muted-foreground">
                          <UtensilsCrossed className="h-6 w-6 text-muted-foreground/60" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <VegMark veg={item.veg} />
                          <p className="truncate text-sm font-bold text-foreground">{item.name}</p>
                        </div>
                        <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                          {formatINR(item.price)} each
                        </p>
                        <p className="mt-1 text-xs font-extrabold text-foreground">
                          {formatINR(item.price * qty)}
                        </p>
                      </div>

                      {/* Stepper */}
                      <div className="flex h-9 shrink-0 items-center rounded-lg border border-border/80 bg-background shadow-xs">
                        <button 
                          onClick={() => cart.remove(item.id)} 
                          className="grid h-9 w-8 place-items-center text-muted-foreground transition-colors hover:text-foreground active:scale-95" 
                          aria-label="Remove one"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-7 text-center text-xs font-extrabold text-foreground">{qty}</span>
                        <button 
                          onClick={() => cart.add(item)} 
                          disabled={qty >= 50} 
                          className="grid h-9 w-8 place-items-center text-forest transition-colors hover:text-forest/80 disabled:opacity-40 active:scale-95" 
                          aria-label="Add one"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button 
                        onClick={() => cart.removeLine(item.id)} 
                        className="grid h-9 w-8 shrink-0 place-items-center text-muted-foreground/70 transition-colors hover:text-destructive" 
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cooking Instructions */}
              <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Special Kitchen Requests
                </div>
                <Textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value.slice(0, 300))} 
                  placeholder="e.g. Less spicy, keep chutney on the side, extra napkins..." 
                  className="rounded-xl border-border/70 bg-background text-sm transition-all focus:border-forest focus:ring-forest/20 shadow-xs resize-none" 
                  rows={3}
                />
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {["Less spicy", "Extra spicy", "No onions/garlic", "Sauce on side"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => addPresetNote(p)}
                      className="rounded-lg border border-border/60 bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:border-forest/40 hover:text-foreground transition-all"
                    >
                      + {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Guest details (desktop only) & Bill Breakdown */}
            <aside className="space-y-4">
              <div className="hidden rounded-2xl border border-border/70 bg-card p-4 shadow-soft lg:block">
                <div className="mb-3 flex items-center justify-between border-b border-border/50 pb-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Table & Guest</p>
                  <span className="text-[11px] text-muted-foreground">Required for order</span>
                </div>
                <GuestDetails errors={errors} className="grid-cols-1" />
              </div>

              {/* Bill Details */}
              <div className="space-y-3 rounded-2xl border border-border/70 bg-card p-4.5 text-sm shadow-soft">
                <div className="flex items-center gap-2 border-b border-border/50 pb-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Receipt className="h-4 w-4 text-forest" /> Bill Summary
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-foreground">{formatINR(cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxes & Charges</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Included</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Payment Method</span>
                    <span className="font-semibold text-foreground">Pay after meal</span>
                  </div>
                </div>

                <div className="flex justify-between border-t border-border/70 pt-3 font-display text-base font-extrabold text-foreground">
                  <span>To Pay Later</span>
                  <span className="text-forest">{formatINR(cart.subtotal)}</span>
                </div>

                <div className="rounded-xl bg-forest/5 p-3 text-xs text-forest flex items-start gap-2.5 border border-forest/15">
                  <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Your order goes straight to the kitchen. You can pay via cash/card/UPI at the counter after dining.</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* Sticky Bottom Order Submission */}
      {cart.count > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/95 p-4 backdrop-blur-md">
          <div className="mx-auto max-w-xl">
            <Button
              size="lg"
              className="flex h-14 w-full items-center justify-between rounded-2xl bg-forest px-6 text-base font-bold text-forest-foreground shadow-elevated transition-all hover:bg-forest/90 active:scale-[0.99] disabled:opacity-50"
              disabled={order.isPending}
              onClick={submit}
            >
              {order.isPending ? (
                <span className="mx-auto flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" /> Transmitting to kitchen…
                </span>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                    <span>Confirm & Send to Kitchen</span>
                  </div>
                  <span className="font-extrabold text-lg">{formatINR(cart.subtotal)}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
