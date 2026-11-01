import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, Loader2, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { WithOwnerRestaurant } from "@/components/admin/owner-restaurant";
import { formatINR } from "@/lib/demo-data";
import {
  minutesSince,
  nextStatus,
  restaurantOrdersQuery,
  STATUS_LABEL,
  useOrdersRealtime,
  useUpdateOrderStatus,
  type KitchenOrder,
  type OrderStatus,
} from "@/lib/orders-api";
import { cn } from "@/lib/utils";

const columns: { key: OrderStatus; accent: string; badge: string }[] = [
  {
    key: "received",
    accent: "border-t-blue-500",
    badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  {
    key: "accepted",
    accent: "border-t-indigo-500",
    badge: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  },
  {
    key: "preparing",
    accent: "border-t-amber-500",
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  {
    key: "ready",
    accent: "border-t-emerald-500",
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
];

/** Live kitchen board for the signed-in owner's restaurant. */
export function KdsBoard({ dark = false }: { dark?: boolean }) {
  return (
    <WithOwnerRestaurant>{(r) => <Board restaurantId={r.id} dark={dark} />}</WithOwnerRestaurant>
  );
}

function Board({ restaurantId, dark }: { restaurantId: string; dark: boolean }) {
  useOrdersRealtime(restaurantId);
  const { data, isLoading, isError, refetch } = useQuery(restaurantOrdersQuery(restaurantId));
  const update = useUpdateOrderStatus(restaurantId);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  if (isLoading)
    return (
      <div className="grid place-items-center py-28">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="mt-3 text-xs text-stone-400">Connecting to live kitchen feed…</p>
      </div>
    );

  if (isError)
    return (
      <div className="py-20 text-center text-sm">
        <p className="text-rose-400 font-semibold mb-2">Couldn't load kitchen orders.</p>
        <button
          onClick={() => refetch()}
          className="rounded-xl bg-stone-800 px-4 py-2 font-bold text-white hover:bg-stone-700"
        >
          Retry Connection
        </button>
      </div>
    );

  const orders = data ?? [];
  const servedToday = orders.filter(
    (o) =>
      o.status === "served" &&
      new Date(o.createdAt).toDateString() === new Date(now).toDateString(),
  ).length;

  const move = (o: KitchenOrder) => {
    const n = nextStatus(o.status);
    if (!n) return;
    update.mutate(
      { id: o.id, status: n.to },
      {
        onSuccess: () => toast.success(`${o.code} → ${STATUS_LABEL[n.to]}`),
        onError: (e) => toast.error(e.message || "Couldn't update the order"),
      },
    );
  };

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900/60 border border-stone-800/80 rounded-2xl px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-xs font-bold text-white uppercase tracking-wider">
            Kitchen Display Line · Live WebSocket Active
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-stone-400">
          <span>
            <strong className="text-white font-extrabold">{servedToday}</strong> orders served today
          </span>
          <span>•</span>
          <span>Auto-refreshes every 30s</span>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {columns.map((col) => {
          const list = orders
            .filter((o) => o.status === col.key)
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

          return (
            <div key={col.key} className="min-w-0 flex flex-col">
              {/* Column Header */}
              <div className="mb-3.5 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-sm font-bold uppercase tracking-wider text-stone-300">
                    {STATUS_LABEL[col.key]}
                  </h2>
                </div>
                <span
                  className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold border", col.badge)}
                >
                  {list.length}
                </span>
              </div>

              {/* Tickets Column */}
              <div className="space-y-4 flex-1">
                {list.map((o) => {
                  const mins = minutesSince(o.createdAt, now);
                  const n = nextStatus(o.status);
                  const busy = update.isPending && update.variables?.id === o.id;
                  const isLate = mins > 12;

                  return (
                    <div
                      key={o.id}
                      data-testid={`ticket-${o.code}`}
                      className={cn(
                        "relative rounded-2xl border-t-4 p-4.5 transition-all shadow-md",
                        col.accent,
                        dark
                          ? "bg-stone-900 border-x border-b border-stone-800 text-stone-100"
                          : "bg-white border-x border-b border-stone-200 text-stone-900",
                      )}
                    >
                      {/* Ticket Header: Table + Time */}
                      <div className="flex items-start justify-between gap-2 border-b border-stone-800/40 pb-3">
                        <div>
                          <p className="font-display text-3xl font-extrabold tracking-tight text-white">
                            T{o.table}
                          </p>
                          <p className="truncate text-xs text-stone-400 mt-0.5 font-mono">
                            {o.code} · {o.customerName}
                          </p>
                        </div>
                        <div
                          className={cn(
                            "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold",
                            isLate
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              : "bg-stone-800 text-stone-300",
                          )}
                        >
                          <Clock className="h-3.5 w-3.5" />
                          <span>{mins}m ago</span>
                        </div>
                      </div>

                      {/* Ticket Items List */}
                      <ul className="my-3.5 space-y-2">
                        {o.items.map((it) => (
                          <li key={it.id} className="flex items-start gap-2.5 text-sm">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-extrabold border border-emerald-500/30">
                              {it.qty}
                            </span>
                            <span className="font-bold text-white leading-tight">{it.name}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Special Cooking Note */}
                      {o.notes && (
                        <div className="mb-3.5 flex items-start gap-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 px-2.5 py-1.5 text-xs font-semibold text-amber-300">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span>Note: {o.notes}</span>
                        </div>
                      )}

                      {/* Ticket Total */}
                      <div className="flex items-center justify-between text-xs text-stone-400 pt-2 border-t border-stone-800/40">
                        <span>Total:</span>
                        <span className="font-bold text-stone-200">{formatINR(o.total)}</span>
                      </div>

                      {/* Action Advance Button */}
                      {n && (
                        <button
                          disabled={busy}
                          onClick={() => move(o)}
                          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-bold text-white shadow-md shadow-emerald-600/25 transition-all active:scale-[0.98] disabled:opacity-60"
                        >
                          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                          <span>{n.action}</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  );
                })}

                {list.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-stone-800 p-8 text-center text-xs text-stone-500">
                    No orders waiting
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
