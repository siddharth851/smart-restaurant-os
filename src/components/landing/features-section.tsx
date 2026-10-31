import {
  QrCode,
  ChefHat,
  BookOpen,
  Users,
  BarChart3,
  LayoutGrid,
} from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      title: "QR Code Ordering",
      desc: "Let customers scan, browse and place orders directly from their smartphone.",
      icon: QrCode,
      color: "bg-emerald-50 text-emerald-600 border-emerald-200/60",
      accent: "text-emerald-700",
    },
    {
      title: "Real-time Kitchen Display",
      desc: "Orders appear instantly in kitchen with live status and preparation timers.",
      icon: ChefHat,
      color: "bg-rose-50 text-rose-600 border-rose-200/60",
      accent: "text-rose-700",
    },
    {
      title: "Menu Management",
      desc: "Easily manage categories, dishes, prices, photos and 86 stock availability.",
      icon: BookOpen,
      color: "bg-sky-50 text-sky-600 border-sky-200/60",
      accent: "text-sky-700",
    },
    {
      title: "Staff Management",
      desc: "Add staff and control permissions across managers, chefs and floor staff.",
      icon: Users,
      color: "bg-purple-50 text-purple-600 border-purple-200/60",
      accent: "text-purple-700",
    },
    {
      title: "Analytics & Insights",
      desc: "Track orders, revenue trends, peak hours and popular bestselling items.",
      icon: BarChart3,
      color: "bg-amber-50 text-amber-600 border-amber-200/60",
      accent: "text-amber-700",
    },
    {
      title: "Multi-Table Support",
      desc: "Handle multiple tables simultaneously with custom indoor and patio zones.",
      icon: LayoutGrid,
      color: "bg-pink-50 text-pink-600 border-pink-200/60",
      accent: "text-pink-700",
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-28 bg-white text-stone-900 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 shadow-xs mb-4">
            Why Restaurants Choose DineOS
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-stone-900">
            Everything You Need to Run a{" "}
            <span className="text-emerald-600">Smarter Restaurant</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed">
            From QR ordering to real-time kitchen updates, DineOS helps you save time, reduce costs, and create a better dining experience for your customers.
          </p>
        </div>

        {/* Feature Cards Grid (2x3 or 3x2) */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="group relative rounded-3xl border border-stone-200/80 bg-stone-50/50 p-6 sm:p-7 shadow-sm transition-all duration-300 hover:border-stone-300 hover:bg-white hover:shadow-xl hover:-translate-y-1"
              >
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border ${feat.color} shadow-xs mb-5 transition-transform group-hover:scale-110`}
                >
                  <Icon className="h-6 w-6 stroke-[2]" />
                </div>
                <h3 className="font-display text-lg font-bold text-stone-900 group-hover:text-emerald-700 transition-colors">
                  {feat.title}
                </h3>
                <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
