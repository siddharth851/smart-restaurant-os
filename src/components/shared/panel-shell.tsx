import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, type ReactNode } from "react";
import { Bell, LogOut, Menu, Search, X, type LucideIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { signOutAll } from "@/lib/auth";

export type NavItem = { to: string; label: string; icon: LucideIcon; exact?: boolean };

type Props = {
  brand: string;
  subtitle: string;
  nav: NavItem[];
  tone: "forest" | "light";
  user: { name: string; role: string };
  footer?: ReactNode;
};

export function PanelShell({ brand, subtitle, nav, user, footer }: Props) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [signingOut, setSigningOut] = useState(false);

  const signOut = async () => {
    setSigningOut(true);
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOutAll();
    navigate({ to: "/login", replace: true });
  };

  const isActive = (n: NavItem) =>
    n.exact ? pathname === n.to || pathname === `${n.to}/` : pathname.startsWith(n.to);

  const initials = user.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const sidebarContent = (
    <div className="flex h-full flex-col bg-stone-950 text-stone-200 border-r border-stone-800/80 select-none">
      {/* Brand Header */}
      <div className="flex h-18 items-center gap-3 px-6 border-b border-stone-900 bg-stone-950/80">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 font-display text-sm font-extrabold shadow-md shadow-amber-500/20">
          {brand.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
            {brand}
          </p>
          <p className="truncate text-[11px] font-medium text-stone-400">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-3.5 py-5 no-scrollbar">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-stone-500">
          Management
        </div>
        {nav.map((n) => {
          const active = isActive(n);
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200",
                active
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs"
                  : "text-stone-400 hover:bg-stone-900 hover:text-stone-200",
              )}
            >
              <Icon
                className={cn(
                  "h-4.5 w-4.5 shrink-0 transition-colors",
                  active ? "text-emerald-400" : "text-stone-500 group-hover:text-stone-300",
                )}
              />
              <span className="flex-1 truncate">{n.label}</span>
              {active && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Area */}
      <div className="p-4 border-t border-stone-900 bg-stone-950/60">
        {footer ? (
          footer
        ) : (
          <div className="flex items-center justify-between text-xs text-stone-400 px-2 py-1">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Cloud Active
            </span>
            <span className="text-[10px] text-stone-600">v2.4</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 selection:bg-emerald-500 selection:text-stone-950">
      {/* Desktop Fixed Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block shadow-xl">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-4 top-4 text-white hover:bg-white/10"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 flex h-18 items-center gap-3 border-b border-stone-200/90 bg-white/90 px-4 sm:px-6 lg:px-8 backdrop-blur-md shadow-xs">
          {/* Mobile Menu Trigger */}
          <Button
            size="icon"
            variant="ghost"
            className="lg:hidden text-stone-700 hover:bg-stone-100"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Quick Search Bar */}
          <div className="relative hidden max-w-sm flex-1 sm:block">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              placeholder="Quick search orders, items, tables…"
              className="h-10 w-full rounded-xl border border-stone-200 bg-stone-50/80 pl-10 pr-12 text-sm text-stone-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-3 focus:ring-emerald-500/15"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-semibold text-stone-400 bg-stone-200/60 px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </div>

          {/* Right User Bar */}
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Button
              size="icon"
              variant="ghost"
              className="relative text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl"
              aria-label="Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500" />
            </Button>

            <div className="h-6 w-px bg-stone-200 hidden sm:block" />

            {/* User Profile Capsule */}
            <div className="flex items-center gap-2.5 pl-1">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-xs font-bold text-white shadow-xs">
                {initials || "U"}
              </div>
              <div className="hidden max-w-40 leading-tight sm:block text-left">
                <p className="truncate text-xs font-bold text-stone-900">{user.name}</p>
                <p className="truncate text-[10px] font-semibold text-emerald-700 capitalize">
                  {user.role.replace("_", " ")}
                </p>
              </div>
            </div>

            {/* Sign Out Button */}
            <Button
              size="icon"
              variant="ghost"
              onClick={signOut}
              disabled={signingOut}
              className="text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4.5 w-4.5" />
            </Button>
          </div>
        </header>

        {/* Routed Sub-pages Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
