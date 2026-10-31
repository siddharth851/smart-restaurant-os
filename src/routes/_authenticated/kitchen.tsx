import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { hasAnyRole, PANEL_ROLES } from "@/lib/auth";
import { ArrowLeft, ChefHat, LogOut } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { restaurant } from "@/lib/demo-data";
import { useMyRestaurant } from "@/lib/restaurant-api";

export const Route = createFileRoute("/_authenticated/kitchen")({
  head: () => ({
    meta: [
      { title: `Kitchen Display — ${restaurant.name}` },
      { name: "description", content: "Full-screen kitchen ticket board for live orders." },
      { property: "og:title", content: "Kitchen Display — Smart Restaurant OS" },
      { property: "og:description", content: "Live ticket board for your kitchen line." },
    ],
  }),
  beforeLoad: ({ context }) => {
    if (!hasAnyRole(context.auth.roles, [...PANEL_ROLES.kitchen])) throw redirect({ to: "/unauthorized" });
  },
  component: KitchenLayout,
});

function KitchenLayout() {
  const { auth } = Route.useRouteContext();
  const canAdmin = hasAnyRole(auth.roles, [...PANEL_ROLES.restaurant]);
  const myName = useMyRestaurant(auth.userId).data?.name;
  return (
    <div className="min-h-screen bg-kds text-kds-foreground">
      <header className="flex h-16 items-center gap-3 border-b border-kds-card px-4 sm:px-6">
        {canAdmin && <Link to="/restaurant" className="grid h-10 w-10 place-items-center rounded-lg bg-kds-card" aria-label="Back to admin"><ArrowLeft className="h-4 w-4" /></Link>}
        <ChefHat className="h-5 w-5 text-primary-glow" />
        <div className="min-w-0">
          <p className="truncate font-display font-bold">Kitchen Display</p>
          <p className="truncate text-xs opacity-60">{myName ?? ""}</p>
        </div>
        <span className="ml-auto flex items-center gap-2 text-xs font-semibold"><span className="h-2 w-2 animate-pulse rounded-full bg-success" /> Live</span>
        <KitchenSignOut />
      </header>
      <main className="p-4 sm:p-6"><Outlet /></main>
    </div>
  );
}

function KitchenSignOut() {
  const navigate = useNavigate();
  return (
    <button
      onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/login", replace: true }); }}
      className="grid h-10 w-10 place-items-center rounded-lg bg-kds-card" aria-label="Sign out" title="Sign out"
    >
      <LogOut className="h-4 w-4" />
    </button>
  );
}
