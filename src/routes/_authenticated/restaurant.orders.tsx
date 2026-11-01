import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel, SimpleTable, StatusBadge } from "@/components/shared/ui-bits";
import { WithOwnerRestaurant } from "@/components/admin/owner-restaurant";
import { formatINR } from "@/lib/demo-data";
import {
  nextStatus,
  ORDER_FLOW,
  restaurantOrdersQuery,
  STATUS_LABEL,
  useOrdersRealtime,
  useUpdateOrderStatus,
  type OrderStatus,
} from "@/lib/orders-api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/restaurant/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  return (
    <>
      <PageHeader
        title="Live Orders"
        description="Monitor, advance and fulfill active dining orders in real time."
      />
      <WithOwnerRestaurant>{(r) => <OrdersList restaurantId={r.id} />}</WithOwnerRestaurant>
    </>
  );
}

function OrdersList({ restaurantId }: { restaurantId: string }) {
  useOrdersRealtime(restaurantId);
  const [f, setF] = useState<"all" | OrderStatus>("all");
  const { data, isLoading, isError, refetch } = useQuery(restaurantOrdersQuery(restaurantId));
  const update = useUpdateOrderStatus(restaurantId);
  const list = (data ?? []).filter((o) => f === "all" || o.status === f);

  return (
    <>
      {/* Status Filter Chips */}
      <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1">
        {(["all", ...ORDER_FLOW] as const).map((x) => (
          <button
            key={x}
            onClick={() => setF(x)}
            className={cn(
              "h-9 shrink-0 rounded-full px-4 text-xs font-bold transition-all shadow-2xs",
              f === x
                ? "bg-emerald-600 text-white shadow-xs shadow-emerald-600/20"
                : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-900",
            )}
          >
            {x === "all" ? "All Orders" : STATUS_LABEL[x]}
          </button>
        ))}
      </div>

      <Panel>
        {isLoading ? (
          <div className="grid place-items-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            <p className="mt-2 text-xs text-stone-400">Loading live orders…</p>
          </div>
        ) : isError ? (
          <div className="py-14 text-center">
            <p className="text-sm font-semibold text-rose-600 mb-3">
              Couldn't load orders from the database.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="rounded-xl border-stone-200 hover:bg-stone-50"
            >
              Retry Loading Orders
            </Button>
          </div>
        ) : list.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
              <span className="font-mono text-base font-bold">#</span>
            </div>
            <p className="font-display text-sm font-bold text-stone-900">No orders found</p>
            <p className="mt-1 text-xs text-stone-500 max-w-sm mx-auto">
              New orders will pop up here instantly as soon as guests scan table QR codes and submit
              their orders.
            </p>
          </div>
        ) : (
          <SimpleTable
            head={[
              "Order Code",
              "Table & Guest",
              "Items Ordered",
              "Total",
              "Placed Time",
              "Status",
              "Action",
            ]}
            rows={list.map((o) => {
              const n = nextStatus(o.status);
              const isBusy = update.isPending && update.variables?.id === o.id;
              return [
                <span className="font-mono text-xs font-bold text-stone-900 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200">
                  {o.code}
                </span>,
                <div>
                  <span className="font-bold text-stone-900 block">{o.customerName}</span>
                  <span className="inline-block text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 mt-0.5">
                    Table {o.table}
                  </span>
                </div>,
                <div className="max-w-xs">
                  <p className="text-xs text-stone-700 line-clamp-2">
                    {o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}
                  </p>
                  {o.notes && (
                    <span className="mt-1 inline-block rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-200/60">
                      Note: {o.notes}
                    </span>
                  )}
                </div>,
                <span className="font-display font-extrabold text-stone-900">
                  {formatINR(o.total)}
                </span>,
                <span className="text-xs text-stone-500 whitespace-nowrap">
                  {new Date(o.createdAt).toLocaleString([], {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>,
                <StatusBadge status={STATUS_LABEL[o.status]} />,
                n ? (
                  <button
                    disabled={isBusy}
                    onClick={() =>
                      update.mutate(
                        { id: o.id, status: n.to },
                        {
                          onSuccess: () =>
                            toast.success(`Order ${o.code} marked as ${STATUS_LABEL[n.to]}`),
                          onError: (e) => toast.error(e.message),
                        },
                      )
                    }
                    className="flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-emerald-600 px-3.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-xs transition-all active:scale-[0.98] disabled:opacity-60"
                  >
                    {isBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>{n.action}</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-stone-400">Completed</span>
                ),
              ];
            })}
          />
        )}
      </Panel>
    </>
  );
}
