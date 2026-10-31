import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, type ReactNode } from "react";
import { 
  Clock, 
  Flame, 
  MapPin, 
  Minus, 
  Phone, 
  Plus, 
  Search, 
  ShoppingBag, 
  Sparkles, 
  Star, 
  UtensilsCrossed, 
  X,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { formatINR } from "@/lib/demo-data";
import { GuestDetails } from "@/components/customer/guest-details";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { publicMenuQuery, type PublicItem } from "@/lib/restaurant-api";
import { useCart } from "@/lib/cart";
import { VegMark } from "@/components/shared/ui-bits";
import { cn } from "@/lib/utils";

import { z } from "zod";
import { useEffect } from "react";

export const Route = createFileRoute("/menu/$restaurantSlug/")({
  validateSearch: z.object({ table: z.coerce.number().optional() }),
  component: MenuPage,
});

function MenuPage() {
  const { restaurantSlug } = Route.useParams();
  const { table } = Route.useSearch();
  const { data, isLoading, isError, refetch } = useQuery(publicMenuQuery(restaurantSlug));
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [vegOnly, setVegOnly] = useState(false);
  const cart = useCart();

  // If table parameter passed in QR URL, automatically pre-fill in customer cart
  useEffect(() => {
    if (table && table > 0) {
      cart.setTable(table);
    }
  }, [table]);

  const items = useMemo(
    () =>
      (data?.items ?? []).filter(
        (m) =>
          (cat === "all" || m.categoryId === cat) &&
          (!vegOnly || m.veg) &&
          (m.name + " " + m.description).toLowerCase().includes(q.trim().toLowerCase()),
      ),
    [data, q, cat, vegOnly],
  );


  if (isLoading) return <MenuSkeleton />;
  if (isError)
    return (
      <Centered title="Couldn't load the menu" text="Check your connection and try again.">
        <button 
          onClick={() => refetch()} 
          className="mt-4 h-11 rounded-xl bg-forest px-6 text-sm font-semibold text-forest-foreground shadow-md transition-all hover:bg-forest/90"
        >
          Retry
        </button>
      </Centered>
    );
  if (!data) return <Centered title="Restaurant not found" text="This menu link may be wrong or no longer active." />;

  const r = data.restaurant;
  const usedCats = data.categories.filter((c) => data.items.some((i) => i.categoryId === c.id));

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Cover Banner */}
      <div className="relative h-52 overflow-hidden bg-gradient-forest sm:h-72 lg:rounded-b-3xl">
        {r.cover ? (
          <img 
            src={r.cover} 
            alt={r.name} 
            width={1600} 
            height={800} 
            className="h-full w-full object-cover object-center filter brightness-90" 
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-forest via-forest/90 to-background/90" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/30" />
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Digital Menu</span>
        </div>
      </div>

      {/* Restaurant Header Card */}
      <div className="relative -mt-14 px-4 max-w-4xl mx-auto">
        <div className="rounded-2xl border border-border/80 bg-card p-4.5 shadow-elevated sm:p-6 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            {r.logo ? (
              <img 
                src={r.logo} 
                alt={`${r.name} logo`} 
                width={80} 
                height={80} 
                className="h-16 w-16 shrink-0 rounded-2xl object-cover shadow-soft ring-2 ring-forest/20 sm:h-20 sm:w-20" 
              />
            ) : (
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-forest font-display text-xl font-extrabold text-forest-foreground shadow-soft ring-2 ring-forest/20 sm:h-20 sm:w-20">
                {r.initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-xl font-extrabold text-foreground sm:text-2xl font-display">{r.name}</h1>
                <span title="Verified Restaurant" className="text-emerald-600 shrink-0">
                  <ShieldCheck className="h-4 w-4 fill-emerald-100" />
                </span>
              </div>
              {r.tagline && <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground sm:text-sm">{r.tagline}</p>}
              
              <div className="mt-2.5 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-xs text-muted-foreground">
                {r.rating && (
                  <span className="flex items-center gap-1 font-bold text-foreground bg-amber-500/10 px-2 py-0.5 rounded-md text-amber-700 dark:text-amber-400">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    {r.rating}
                  </span>
                )}
                {r.hours && (
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="h-3.5 w-3.5 text-forest" />
                    {r.hours}
                  </span>
                )}
                {r.address && (
                  <span className="flex min-w-0 items-center gap-1 font-medium">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate max-w-[200px] sm:max-w-none">{r.address}</span>
                  </span>
                )}
                {r.phone && (
                  <a href={`tel:${r.phone}`} className="flex items-center gap-1 font-medium text-forest hover:underline">
                    <Phone className="h-3.5 w-3.5" />
                    {r.phone}
                  </a>
                )}
              </div>
            </div>
          </div>

          {r.isSuspended ? (
            <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-center">
              <p className="text-sm font-bold text-destructive">⚠️ Restaurant Service Temporarily Paused</p>
              <p className="mt-1 text-xs text-muted-foreground">This restaurant is currently suspended and is not accepting new orders at this time.</p>
            </div>
          ) : (
            /* Table & Guest Pre-Order Box */
            <div className="mt-4 rounded-xl border border-border/70 bg-muted/40 p-3.5 sm:p-4">
              <div className="mb-2.5 flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Dining Information
                </p>
                <span className="text-[11px] text-muted-foreground/80">No account required</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky search + categories */}
      <div className="sticky top-0 z-20 mt-4 border-b border-border/60 bg-background/95 px-4 pb-3.5 pt-3.5 backdrop-blur-md">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex gap-2.5">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
              <input 
                value={q} 
                onChange={(e) => setQ(e.target.value)} 
                placeholder="Search menu dishes..." 
                inputMode="search" 
                className="h-11 w-full rounded-xl border border-border/70 bg-card pl-10 pr-9 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-forest focus:ring-2 focus:ring-forest/20 shadow-xs" 
              />
              {q && (
                <button 
                  onClick={() => setQ("")} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button 
              onClick={() => setVegOnly((v) => !v)} 
              aria-pressed={vegOnly} 
              className={cn(
                "flex h-11 shrink-0 items-center gap-2 rounded-xl border px-3.5 text-xs font-bold transition-all shadow-xs",
                vegOnly 
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-400" 
                  : "border-border/70 bg-card text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              <VegMark veg /> Veg Only
            </button>
          </div>

          {usedCats.length > 0 && (
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pt-0.5">
              {[{ id: "all", name: "All Dishes" }, ...usedCats].map((c) => (
                <button 
                  key={c.id} 
                  onClick={() => setCat(c.id)} 
                  className={cn(
                    "h-8.5 shrink-0 rounded-full px-4 text-xs font-semibold transition-all shadow-xs",
                    cat === c.id 
                      ? "bg-forest text-forest-foreground font-bold shadow-soft" 
                      : "border border-border/70 bg-card text-muted-foreground hover:border-forest/40 hover:text-foreground"
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Food Items Grid */}
      <div className="max-w-4xl mx-auto px-4 pt-5">
        <div className="grid gap-3.5 sm:gap-4 lg:grid-cols-2">
          {items.map((m) => <FoodCard key={m.id} item={m} />)}
          {items.length === 0 && (
            <div className="py-20 text-center lg:col-span-2">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
                <UtensilsCrossed className="h-6 w-6" />
              </div>
              <p className="mt-3 text-base font-bold text-foreground">
                {data.items.length === 0 ? "The kitchen is preparing the menu" : "No dishes found"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {data.items.length === 0 ? "Please check back with the staff shortly." : "Try clearing your search query or vegetarian filter."}
              </p>
              {q && (
                <button onClick={() => setQ("")} className="mt-3 text-xs font-semibold text-forest underline">
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Cart Bar */}
      {cart.count > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Link 
            to="/menu/$restaurantSlug/cart" 
            params={{ restaurantSlug }} 
            className="mx-auto flex h-14 max-w-xl items-center justify-between rounded-2xl bg-forest px-5 text-forest-foreground shadow-elevated transition-transform active:scale-[0.99] hover:bg-forest/95"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/20">
                <ShoppingBag className="h-4.5 w-4.5 text-white" />
                <span className="absolute -top-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-emerald-400 text-[10px] font-extrabold text-forest">
                  {cart.count}
                </span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold leading-tight">
                  {cart.count} {cart.count === 1 ? "item" : "items"}
                </p>
                <p className="text-xs text-forest-foreground/80 font-medium">
                  {formatINR(cart.subtotal)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-sm bg-white/15 px-3 py-1.5 rounded-xl">
              <span>View Cart</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

function FoodCard({ item }: { item: PublicItem }) {
  const cart = useCart();
  const qty = cart.qtyOf(item.id);
  const [open, setOpen] = useState(false);

  return (
    <>
      <DishSheet item={item} open={open} onOpenChange={setOpen} />
      <article 
        className={cn(
          "group flex gap-3.5 rounded-2xl border border-border/70 bg-card p-3.5 shadow-soft transition-all hover:border-forest/30 hover:shadow-md sm:gap-4",
          !item.available && "opacity-60"
        )}
      >
        <div className="min-w-0 flex-1 py-0.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <VegMark veg={item.veg} />
              {item.bestseller && (
                <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                  <Sparkles className="h-2.5 w-2.5" /> Bestseller
                </span>
              )}
              {item.spicy && (
                <span className="inline-flex items-center gap-0.5 rounded-md bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-bold text-rose-600">
                  <Flame className="h-3 w-3 text-rose-500" /> Spicy
                </span>
              )}
            </div>

            <button 
              onClick={() => setOpen(true)} 
              className="mt-1.5 text-left font-display text-base font-bold text-foreground leading-snug group-hover:text-forest transition-colors line-clamp-1"
            >
              {item.name}
            </button>
            <p className="mt-0.5 text-sm font-extrabold text-foreground">
              {formatINR(item.price)}
            </p>
            {item.description && (
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            )}
          </div>
        </div>

        {/* Thumbnail & Add Action */}
        <div className="relative w-28 shrink-0 pb-3 sm:w-32">
          {item.image ? (
            <button 
              onClick={() => setOpen(true)} 
              className="block w-full overflow-hidden rounded-xl" 
              aria-label={`View ${item.name}`}
            >
              <img 
                src={item.image} 
                alt={item.name} 
                loading="lazy" 
                width={816} 
                height={816} 
                className="aspect-square w-full rounded-xl object-cover transition-transform duration-300 group-hover:scale-105" 
              />
            </button>
          ) : (
            <button 
              onClick={() => setOpen(true)} 
              aria-label={`View ${item.name}`} 
              className="grid aspect-square w-full place-items-center rounded-xl bg-muted text-muted-foreground"
            >
              <UtensilsCrossed className="h-7 w-7 text-muted-foreground/60" />
            </button>
          )}

          <div className="absolute inset-x-1.5 bottom-0">
            {!item.available ? (
              <div className="h-9 rounded-lg border border-border/80 bg-card text-center text-xs font-semibold leading-9 text-muted-foreground shadow-xs">
                Sold Out
              </div>
            ) : qty === 0 ? (
              <button 
                onClick={() => cart.add(item)} 
                className="h-9 w-full rounded-lg border border-forest/30 bg-card text-xs font-bold text-forest shadow-xs transition-all hover:bg-forest hover:text-forest-foreground active:scale-95 uppercase tracking-wide"
              >
                ADD
              </button>
            ) : (
              <div className="flex h-9 items-center justify-between rounded-lg bg-forest px-1 text-forest-foreground shadow-soft">
                <button 
                  onClick={() => cart.remove(item.id)} 
                  className="grid h-8 w-8 place-items-center rounded hover:bg-white/20 transition-colors" 
                  aria-label="Remove one"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="text-xs font-extrabold">{qty}</span>
                <button 
                  onClick={() => cart.add(item)} 
                  className="grid h-8 w-8 place-items-center rounded hover:bg-white/20 transition-colors" 
                  aria-label="Add one"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </article>
    </>
  );
}

function DishSheet({ item, open, onOpenChange }: { item: PublicItem; open: boolean; onOpenChange: (o: boolean) => void }) {
  const cart = useCart();
  const qty = cart.qtyOf(item.id);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="mx-auto max-h-[90vh] max-w-xl overflow-y-auto rounded-t-3xl p-0 border-t border-border">
        {item.image ? (
          <img 
            src={item.image} 
            alt={item.name} 
            className="aspect-[4/3] w-full object-cover sm:aspect-video" 
          />
        ) : (
          <div className="grid aspect-video w-full place-items-center bg-muted text-muted-foreground">
            <UtensilsCrossed className="h-12 w-12" />
          </div>
        )}
        <div className="space-y-4 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-2">
            <VegMark veg={item.veg} />
            <span className="text-xs font-semibold text-muted-foreground">
              {item.veg ? "Pure Vegetarian" : "Non-Vegetarian"}
            </span>
            {item.spicy && (
              <span className="flex items-center gap-1 rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-bold text-rose-600">
                <Flame className="h-3 w-3" /> Spicy
              </span>
            )}
          </div>
          <div>
            <SheetTitle className="font-display text-2xl font-extrabold text-foreground">
              {item.name}
            </SheetTitle>
            <p className="mt-1 text-xl font-extrabold text-forest">
              {formatINR(item.price)}
            </p>
          </div>
          <SheetDescription className="text-sm text-muted-foreground leading-relaxed">
            {item.description || "Freshly crafted by the kitchen with authentic ingredients and traditional seasoning."}
          </SheetDescription>

          <div className="pt-2">
            {!item.available ? (
              <div className="h-12 rounded-xl border border-border text-center font-semibold leading-[3rem] text-muted-foreground">
                Currently Out of Stock
              </div>
            ) : qty === 0 ? (
              <button 
                onClick={() => {
                  cart.add(item);
                  onOpenChange(false);
                }} 
                className="h-12 w-full rounded-xl bg-forest font-bold text-forest-foreground shadow-soft transition-all hover:bg-forest/90"
              >
                Add to Cart · {formatINR(item.price)}
              </button>
            ) : (
              <div className="flex h-12 items-center justify-between rounded-xl bg-forest px-3 text-forest-foreground shadow-soft">
                <button 
                  onClick={() => cart.remove(item.id)} 
                  className="grid h-10 w-10 place-items-center rounded-lg hover:bg-white/20 transition-colors" 
                  aria-label="Remove one"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="font-bold text-sm">{qty} in cart</span>
                <button 
                  onClick={() => cart.add(item)} 
                  className="grid h-10 w-10 place-items-center rounded-lg hover:bg-white/20 transition-colors" 
                  aria-label="Add one"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Centered({ title, text, children }: { title: string; text: string; children?: ReactNode }) {
  return (
    <div className="grid min-h-[70vh] place-items-center px-6 text-center">
      <div className="max-w-sm">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-forest/10 text-forest">
          <UtensilsCrossed className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-xl font-bold font-display text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{text}</p>
        {children}
      </div>
    </div>
  );
}

function MenuSkeleton() {
  return (
    <div className="animate-pulse pb-24">
      <div className="h-52 bg-muted sm:h-72" />
      <div className="max-w-4xl mx-auto -mt-14 px-4">
        <div className="h-44 rounded-2xl border border-border bg-card p-5" />
      </div>
      <div className="max-w-4xl mx-auto space-y-3 p-4 pt-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-muted/60" />
        ))}
      </div>
    </div>
  );
}
