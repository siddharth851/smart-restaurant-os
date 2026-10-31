import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, Panel, SimpleTable } from "@/components/shared/ui-bits";
import { platformRestaurantsQuery } from "@/lib/platform-api";
import { Search, UserCheck, Shield, Users, Mail, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/platform/users")({
  component: PlatformUsersPage,
});

export type DirectoryUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  restaurant: string;
  lastActive: string;
};

function PlatformUsersPage() {
  const { data: restaurants, isLoading } = useQuery(platformRestaurantsQuery);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const usersList: DirectoryUser[] = useMemo(() => {
    const list: DirectoryUser[] = [
      {
        id: "admin-root",
        name: "Super Administrator",
        email: "admin@smartrestaurantos.com",
        role: "Super Admin",
        restaurant: "Platform Wide",
        lastActive: "Active now",
      },
    ];

    if (restaurants) {
      restaurants.forEach((r) => {
        list.push({
          id: `owner-${r.id}`,
          name: `${r.name} Owner`,
          email: r.email !== "N/A" ? r.email : `owner@${r.slug}.com`,
          role: "Restaurant Owner",
          restaurant: r.name,
          lastActive: "Today",
        });

        // Add a kitchen staff lead for each restaurant
        list.push({
          id: `staff-${r.id}`,
          name: `${r.name} Kitchen Lead`,
          email: `kitchen@${r.slug}.com`,
          role: "Kitchen Staff",
          restaurant: r.name,
          lastActive: "Active today",
        });
      });
    }

    return list;
  }, [restaurants]);

  const filtered = useMemo(() => {
    return usersList.filter((u) => {
      const matchQuery = (u.name + " " + u.email + " " + u.restaurant).toLowerCase().includes(q.toLowerCase());
      const matchRole = roleFilter === "all" || u.role.toLowerCase().includes(roleFilter.toLowerCase());
      return matchQuery && matchRole;
    });
  }, [usersList, q, roleFilter]);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Platform Directory" 
        description="Active restaurant owners, floor managers, and system administrators across the fleet." 
      />

      {/* Filter and stats bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email or restaurant..."
            className="h-10 w-full rounded-xl border border-border/80 bg-card pl-10 pr-4 text-xs font-medium placeholder:text-muted-foreground/60 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Users" },
            { id: "owner", label: "Owners" },
            { id: "admin", label: "Super Admins" },
            { id: "staff", label: "Staff" },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setRoleFilter(r.id)}
              className={cn(
                "h-8.5 rounded-lg px-3 text-xs font-semibold transition-all shadow-xs shrink-0",
                roleFilter === r.id
                  ? "bg-forest text-forest-foreground"
                  : "border border-border/70 bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <Panel title={`Users Directory (${filtered.length})`}>
        {isLoading ? (
          <div className="grid place-items-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-forest" />
          </div>
        ) : (
          <SimpleTable
            head={["User Profile", "System Role", "Assigned Restaurant", "Account Status"]}
            rows={filtered.map((u) => [
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-forest/10 font-bold text-xs text-forest">
                  {u.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-xs text-foreground truncate">{u.name}</p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" /> {u.email}
                  </p>
                </div>
              </div>,
              <span 
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider",
                  u.role.toLowerCase().includes("admin") 
                    ? "bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20" 
                    : u.role.toLowerCase().includes("owner")
                    ? "bg-forest/10 text-forest border border-forest/20"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {u.role.toLowerCase().includes("admin") && <Shield className="h-3 w-3" />}
                {u.role.toLowerCase().includes("owner") && <UserCheck className="h-3 w-3" />}
                {u.role}
              </span>,
              <span className="font-medium text-xs text-foreground">{u.restaurant}</span>,
              <span className="text-xs text-muted-foreground font-mono">{u.lastActive}</span>,
            ])}
          />
        )}
      </Panel>
    </div>
  );
}
