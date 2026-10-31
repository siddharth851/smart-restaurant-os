import { createFileRoute, redirect } from "@tanstack/react-router";
import { hasAnyRole, PANEL_ROLES, ROLE_LABEL } from "@/lib/auth";
import { BarChart3, ChefHat, ClipboardList, LayoutDashboard, LayoutGrid, QrCode, Settings, Tags, Users, UtensilsCrossed } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { myRestaurantQuery } from "@/lib/restaurant-api";
import { PanelShell, type NavItem } from "@/components/shared/panel-shell";
import { restaurant } from "@/lib/demo-data";

const nav: NavItem[] = [
  { to: "/restaurant", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/restaurant/orders", label: "Orders", icon: ClipboardList },
  { to: "/restaurant/kitchen", label: "Kitchen Display", icon: ChefHat },
  { to: "/restaurant/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/restaurant/categories", label: "Categories", icon: Tags },
  { to: "/restaurant/tables", label: "Tables & QR", icon: QrCode },
  { to: "/restaurant/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/restaurant/settings", label: "Settings", icon: Settings },
];

export const Route = createFileRoute("/_authenticated/restaurant")({
  head: () => ({
    meta: [
      { title: `${restaurant.name} Admin — Smart Restaurant OS` },
      { name: "description", content: "Manage orders, menu, tables and settings for your restaurant." },
      { property: "og:title", content: "Restaurant Admin — Smart Restaurant OS" },
      { property: "og:description", content: "Run your restaurant's QR ordering from one dashboard." },
    ],
  }),
  beforeLoad: ({ context }) => {
    if (!hasAnyRole(context.auth.roles, [...PANEL_ROLES.restaurant])) throw redirect({ to: "/unauthorized" });
  },
  component: RestaurantLayout,
});

function RestaurantLayout() {
  const { auth } = Route.useRouteContext();
  const { data: mine } = useQuery(myRestaurantQuery(auth.userId));
  return (
    <PanelShell
      brand={mine?.name ?? restaurant.name}
      subtitle="Restaurant Admin"
      tone="forest"
      nav={nav}
      user={{ name: auth.name, role: "Restaurant Owner" }}
      footer={
        <a href="/kitchen" className="flex items-center gap-2 rounded-lg bg-sidebar-accent px-3 py-2.5 text-xs font-semibold text-sidebar-accent-foreground">
          <LayoutGrid className="h-4 w-4" /> Open full-screen kitchen
        </a>
      }
    />
  );
}
