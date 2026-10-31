import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { PublicItem } from "./restaurant-api";

type CartLine = { item: PublicItem; qty: number };
export type PlacedOrder = { code: string; total: number; createdAt: string; table: number; customerName: string; lines: { name: string; qty: number; price: number }[] };
type CartCtx = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  table: number | null;
  setTable: (n: number | null) => void;
  customerName: string;
  setCustomerName: (s: string) => void;
  qtyOf: (id: string) => number;
  add: (item: PublicItem) => void;
  remove: (id: string) => void;
  removeLine: (id: string) => void;
  clear: () => void;
  lastOrder: PlacedOrder | null;
  setLastOrder: (o: PlacedOrder | null) => void;
};

const Ctx = createContext<CartCtx | null>(null);
const GUEST_KEY = "sro-guest";

// Client-side cart; orders are saved through placeOrder() in restaurant-api.
export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<Record<string, CartLine>>({});
  const [table, setTable] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [lastOrder, setLastOrder] = useState<PlacedOrder | null>(null);

  // Remember guest name/table for this browser tab (no login).
  useEffect(() => {
    try {
      const g = JSON.parse(sessionStorage.getItem(GUEST_KEY) ?? "null");
      if (g?.name) setCustomerName(String(g.name));
      if (g?.table) setTable(Number(g.table));
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    sessionStorage.setItem(GUEST_KEY, JSON.stringify({ name: customerName, table }));
  }, [customerName, table]);

  const value = useMemo<CartCtx>(() => {
    const list = Object.values(lines).filter((l) => l.qty > 0);
    return {
      lines: list,
      count: list.reduce((s, l) => s + l.qty, 0),
      subtotal: list.reduce((s, l) => s + l.qty * l.item.price, 0),
      table,
      setTable,
      customerName,
      setCustomerName,
      qtyOf: (id) => lines[id]?.qty ?? 0,
      add: (item) => {
        if (!item.available) return;
        setLines((p) => ({ ...p, [item.id]: { item, qty: Math.min(50, (p[item.id]?.qty ?? 0) + 1) } }));
      },
      remove: (id) =>
        setLines((p) => {
          const cur = p[id];
          if (!cur) return p;
          return { ...p, [id]: { ...cur, qty: Math.max(0, cur.qty - 1) } };
        }),
      removeLine: (id) => setLines((p) => { const n = { ...p }; delete n[id]; return n; }),
      clear: () => setLines({}),
      lastOrder,
      setLastOrder,
    };
  }, [lines, table, customerName, lastOrder]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
