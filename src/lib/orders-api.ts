import { useEffect } from "react";
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const ORDER_FLOW = ["received", "accepted", "preparing", "ready", "served"] as const;
export type OrderStatus = (typeof ORDER_FLOW)[number];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  received: "New",
  accepted: "Accepted",
  preparing: "Preparing",
  ready: "Ready",
  served: "Served",
};

/** Next step in the kitchen flow and the button label that moves to it. */
export function nextStatus(s: OrderStatus): { to: OrderStatus; action: string } | null {
  const map: Partial<Record<OrderStatus, { to: OrderStatus; action: string }>> = {
    received: { to: "accepted", action: "Accept" },
    accepted: { to: "preparing", action: "Start preparing" },
    preparing: { to: "ready", action: "Mark ready" },
    ready: { to: "served", action: "Mark served" },
  };
  return map[s] ?? null;
}

export type KitchenOrder = {
  id: string;
  code: string;
  table: number;
  customerName: string;
  notes: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  items: { id: string; name: string; qty: number; price: number }[];
};

/** Owner's orders (RLS: owns_restaurant). Polls as a fallback to realtime. */
export const restaurantOrdersQuery = (restaurantId: string) =>
  queryOptions({
    queryKey: ["orders", restaurantId],
    refetchInterval: 15_000,
    queryFn: async (): Promise<KitchenOrder[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_code, table_number, customer_name, notes, total, status, created_at, order_items(id, name, quantity, unit_price)")
        .eq("restaurant_id", restaurantId)
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) {
        console.error("Failed to query orders for restaurant", restaurantId, error);
        throw error;
      }

      return (data ?? []).map((o) => ({
        id: o.id,
        code: o.order_code,
        table: o.table_number,
        customerName: o.customer_name,
        notes: o.notes ?? "",
        total: Number(o.total),
        status: o.status as OrderStatus,
        createdAt: o.created_at,
        items: (o.order_items ?? []).map((i) => ({ 
          id: i.id, 
          name: i.name, 
          qty: i.quantity, 
          price: Number(i.unit_price) 
        })),
      }));
    },
  });

/** Live updates: refetch when any visible order row changes (RLS limits events to own restaurant). */
export function useOrdersRealtime(restaurantId: string) {
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel(`orders-${restaurantId}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `restaurant_id=eq.${restaurantId}` }, () => {
        qc.invalidateQueries({ queryKey: ["orders", restaurantId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [restaurantId, qc]);
}

export function useUpdateOrderStatus(restaurantId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const { error } = await supabase.rpc("update_order_status", { _order_id: id, _status: status });
      if (error) throw new Error(error.message);
    },
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ["orders", restaurantId] });
      const prev = qc.getQueryData<KitchenOrder[]>(["orders", restaurantId]);
      qc.setQueryData<KitchenOrder[]>(["orders", restaurantId], (l) => l?.map((o) => (o.id === id ? { ...o, status } : o)));
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(["orders", restaurantId], ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: ["orders", restaurantId] }),
  });
}

export type TrackedOrder = {
  code: string;
  status: OrderStatus;
  table: number;
  customerName: string;
  notes: string;
  total: number;
  createdAt: string;
  restaurantName: string;
  slug: string;
  items: { name: string; qty: number; price: number }[];
};

/** Customer tracking by order code (no login); polls every 4s so status updates appear automatically. */
export const trackOrderQuery = (code: string) =>
  queryOptions({
    queryKey: ["track-order", code],
    enabled: !!code,
    refetchInterval: 4_000,
    refetchIntervalInBackground: false,
    queryFn: async (): Promise<TrackedOrder | null> => {
      const { data, error } = await supabase.rpc("get_order_status", { _code: code });
      if (error) throw error;
      if (!data) return null;
      const d = data as { order_code: string; status: string; table_number: number; customer_name: string; notes: string | null; total: number; created_at: string; restaurant_name: string; slug: string; items: { name: string; qty: number; price: number }[] };
      return {
        code: String(d.order_code),
        status: d.status as OrderStatus,
        table: Number(d.table_number),
        customerName: String(d.customer_name),
        notes: String(d.notes ?? ""),
        total: Number(d.total),
        createdAt: String(d.created_at),
        restaurantName: String(d.restaurant_name),
        slug: String(d.slug),
        items: (d.items ?? []).map((i) => ({ name: i.name, qty: Number(i.qty), price: Number(i.price) })),
      };
    },
  });

export function minutesSince(iso: string, now = Date.now()) {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
}
