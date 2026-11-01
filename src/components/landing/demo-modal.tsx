import { Link } from "@tanstack/react-router";
import { ArrowRight, ChefHat, LayoutDashboard, Smartphone, Building2, X } from "lucide-react";

export function DemoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  const panels = [
    {
      to: "/menu/$restaurantSlug",
      params: { restaurantSlug: "saffron-table" },
      title: "1. Customer QR Menu",
      badge: "No Login Required",
      desc: "Contactless dining: scan QR, browse categorized menu, add dishes to cart, and place orders directly to the kitchen.",
      icon: Smartphone,
      color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400",
      cta: "Launch Customer Menu",
    },
    {
      to: "/restaurant",
      params: {},
      title: "2. Restaurant Owner Panel",
      badge: "Owner Workspace",
      desc: "Complete restaurant management: live orders, full kitchen order management, menu & dishes, tables & QR generation, and sales analytics.",
      icon: LayoutDashboard,
      color: "from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400",
      cta: "Open Owner Dashboard",
    },
    {
      to: "/super-admin",
      params: {},
      title: "3. Super Admin Panel",
      badge: "Platform Owner",
      desc: "Platform-wide management: monitor all registered restaurants, activate or suspend outlets, view statistics, and archive restaurants.",
      icon: Building2,
      color: "from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400",
      cta: "Open Super Admin",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl rounded-3xl bg-stone-900 border border-stone-800 p-6 sm:p-8 shadow-2xl text-white max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            Live System Demo
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Explore All 3 Experiences
          </h3>
          <p className="mt-1 text-sm text-stone-400">
            Smart Restaurant OS is fully integrated. Select any experience below to explore the live system.
          </p>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2">
          {panels.map((p) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.title}
                to={p.to}
                params={p.params}
                onClick={onClose}
                className={`group relative flex flex-col justify-between rounded-2xl border p-4 sm:p-5 bg-gradient-to-br ${p.color} hover:border-white/40 transition-all hover:scale-[1.01]`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-950/60 shadow-inner">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-stone-950/40 border border-white/10 text-stone-300">
                      {p.badge}
                    </span>
                  </div>
                  <h4 className="font-display text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                    {p.title}
                  </h4>
                  <p className="mt-1.5 text-xs text-stone-300/80 leading-relaxed">
                    {p.desc}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <span>{p.cta}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-800 text-xs text-stone-400">
          <span>Need your own restaurant setup? It takes less than 2 minutes.</span>
          <Link
            to="/register"
            onClick={onClose}
            className="inline-flex h-9 items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 font-bold text-stone-950 shadow-md shadow-emerald-500/20"
          >
            Register Restaurant Now
          </Link>
        </div>
      </div>
    </div>
  );
}
