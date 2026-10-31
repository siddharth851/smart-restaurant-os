import { createFileRoute, redirect } from "@tanstack/react-router";
import { hasAnyRole, PANEL_ROLES } from "@/lib/auth";
import { Building2, LayoutDashboard } from "lucide-react";
import { PanelShell, type NavItem } from "@/components/shared/panel-shell";

const nav: NavItem[] = [
  { to: "/super-admin", label: "Overview & Restaurants", icon: LayoutDashboard, exact: true },
];

export const Route = createFileRoute("/_authenticated/super-admin")({
  head: () => ({
    meta: [
      { title: "Super Admin Panel — Smart Restaurant OS" },
      { name: "description", content: "Super Admin console for platform owner to manage all restaurants." },
      { property: "og:title", content: "Super Admin Panel — Smart Restaurant OS" },
      { property: "og:description", content: "Oversee and manage all restaurants." },
      { name: "robots", content: "noindex" },
    ],
  }),
  beforeLoad: ({ context }) => {
    if (!hasAnyRole(context.auth.roles, [...PANEL_ROLES.superAdmin])) throw redirect({ to: "/unauthorized" });
  },
  component: SuperAdminLayout,
});

function SuperAdminLayout() {
  const { auth } = Route.useRouteContext();
  return (
    <PanelShell
      brand="Smart Restaurant OS"
      subtitle="Super Admin"
      tone="light"
      nav={nav}
      user={{ name: auth.name, role: "Platform Owner" }}
    />
  );
}
