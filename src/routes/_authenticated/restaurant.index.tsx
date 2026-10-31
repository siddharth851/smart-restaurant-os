import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, IndianRupee, QrCode, Timer, ExternalLink, ArrowRight, Utensils, Loader2 } from "lucide-react";
import { BarChart, PageHeader, Panel, StatCard, StatusBadge } from "@/components/shared/ui-bits";
import { formatINR } from "@/lib/demo-data";
import { Button } from "@/components/ui/button";
import { WithOwnerRestaurant } from "@/components/admin/owner-restaurant";
import { restaurantOrdersQuery, useOrdersRealtime, STATUS_LABEL } from "@/lib/orders-api";
import { itemsQuery } from "@/lib/restaurant-api";

export const Route = createFileRoute("/_authenticated/restaurant/")({ component: DashboardWrapper });

function DashboardWrapper() {
  return (
    <WithOwnerRestaurant>
      {(r, userId) => <OwnerDashboardContent restaurant={r} userId={userId} />}
    </WithOwnerRestaurant>
  );
}

function OwnerDashboardContent({ 
  restaurant: r 
}: { 
  restaurant: { id: string; name: string; slug: string; logoSrc?: string | null }; 
  userId: string;
}) {
  useOrdersRealtime(r.id);
  const { data: orders = [], isLoading: ordersLoading } = useQuery(restaurantOrdersQuery(r.id));
  const { data: menuItems = [] } = useQuery(itemsQuery(r.id));

  const todayStr = new Date().toDateString();
  const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === todayStr);
  const activeOrders = orders.filter((o) => ["received", "accepted", "preparing"].includes(o.status));
  const todayRevenue = todayOrders.reduce((acc, o) => acc + o.total, 0);

  // Distinct occupied tables
  const occupiedTables = new Set(activeOrders.map((o) => o.table)).size;

  // Item sales map
  const itemSales = orders.reduce((acc: Record<string, { name: string; count: number; total: number }>, o) => {
    o.items.forEach((item) => {
      if (!acc[item.name]) acc[item.name] = { name: item.name, count: 0, total: 0 };
      acc[item.name].count += item.qty;
      acc[item.name].total += item.price * item.qty;
    });
    return acc;
  }, {});

  const topItems = Object.values(itemSales).sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <>
      <PageHeader
        title={`Welcome, ${r.name}`}
        description="Real-time pulse of your floor orders, kitchen queue, and sales revenue today."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              asChild
              className="h-10 rounded-xl bg-forest hover:bg-forest/90 text-white font-bold shadow-xs transition-all"
            >
              <Link to="/menu/$restaurantSlug" params={{ restaurantSlug: r.slug }} target="_blank">
                <span>Open Live Guest QR Menu</span>
                <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        }
      />

      {/* 4 Key Performance Metric Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard 
          label="Today's Revenue" 
          value={formatINR(todayRevenue)} 
          delta={`${todayOrders.length} orders today`} 
          icon={IndianRupee} 
        />
        <StatCard 
          label="Active Kitchen Orders" 
          value={String(activeOrders.length)} 
          delta={activeOrders.length > 0 ? "In preparation line" : "Queue clear"} 
          icon={ClipboardList} 
        />
        <StatCard 
          label="Occupied Tables" 
          value={`${occupiedTables} active`} 
          delta={occupiedTables > 0 ? "Diners seated" : "Tables ready"} 
          icon={QrCode} 
        />
        <StatCard 
          label="Live Menu Items" 
          value={`${menuItems.length} dishes`} 
          delta={`${menuItems.filter((m) => m.is_available).length} in stock`} 
          icon={Timer} 
        />
      </div>

      {/* Charts & Top Dishes Grid */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Panel title="Order Revenue Overview" className="lg:col-span-2">
          <p className="text-xs text-muted-foreground mb-3">Gross dining orders processed across your dining room.</p>
          <BarChart
            data={[
              { label: "Today", value: Math.max(todayRevenue, 1) },
              { label: "Total All-Time", value: Math.max(orders.reduce((a, b) => a + b.total, 0), 1) },
            ]}
          />
        </Panel>

        <Panel
          title="Top Selling Dishes"
          action={
            <Link to="/restaurant/menu" className="text-xs font-bold text-forest hover:underline flex items-center gap-1">
              <span>Manage Menu</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          }
        >
          {topItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              <Utensils className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
              <p>Top dishes will appear as guests place orders.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {topItems.map((item, i) => (
                <li key={item.name} className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-forest/10 text-xs font-bold text-forest">
                      #{i + 1}
                    </span>
                    <p className="truncate text-xs font-bold text-foreground">{item.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-foreground">{item.count} sold</span>
                    <p className="text-[10px] text-muted-foreground">{formatINR(item.total)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Live Orders Feed */}
      <Panel
        title="Live Dining Room Feed"
        className="mt-8"
        action={
          <Link to="/restaurant/orders" className="text-xs font-bold text-forest hover:underline flex items-center gap-1">
            <span>View All Live Orders</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      >
        {ordersLoading ? (
          <div className="grid place-items-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-forest" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            <p className="font-semibold text-foreground text-sm">No orders yet</p>
            <p className="mt-1">Guests can scan your table QR code to start ordering.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {orders.slice(0, 5).map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest text-forest-foreground font-display text-xs font-extrabold shadow-xs">
                    T{o.table}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-foreground font-mono">{o.code}</p>
                      <span className="text-[11px] text-muted-foreground font-medium">· {o.customerName}</span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground mt-0.5">
                      {o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-bold text-foreground hidden sm:inline-block">
                    {formatINR(o.total)}
                  </span>
                  <StatusBadge status={STATUS_LABEL[o.status]} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}
