import { ArrowRight, MessageSquare, PhoneCall, Calendar, Building, Sparkles } from "lucide-react";

export function ConsultationSection() {
  const options = [
    {
      icon: MessageSquare,
      title: "Direct Consultation",
      desc: "Speak with our restaurant technology advisors about your floor workflow, guest volume, and KDS setup.",
      actionText: "Chat with an Advisor",
      href: "mailto:support@dineos.app?subject=DineOS%20Restaurant%20Consultation&body=Hello%20DineOS%20Team%2C%0A%0AI%20would%20like%20to%20learn%20more%20about%20implementing%20DineOS%20for%20my%20restaurant.%0A%0ARestaurant%20Name%3A%0ALocation%3A%0ATable%20Count%3A%0APhone%3A",
    },
    {
      icon: Calendar,
      title: "Live Walkthrough",
      desc: "Get a personalized 15-minute walkthrough of the QR ordering flow, kitchen display, and table controls.",
      actionText: "Book a Demo Session",
      href: "mailto:support@dineos.app?subject=Request%20Live%20DineOS%20Walkthrough&body=Hello%2C%20I%20would%20like%20to%20schedule%20a%20live%20walkthrough%20of%20DineOS.%0A%0APreferred%20Time%3A%0ARestaurant%20Type%3A%20(Dine-in%20%2F%20Cafe%20%2F%20Cloud%20Kitchen)%0AContact%20Number%3A",
    },
    {
      icon: Building,
      title: "Multi-Outlet & Chains",
      desc: "Custom centralized menu distribution, multi-location reporting, and franchise permission architecture.",
      actionText: "Enterprise Inquiries",
      href: "mailto:support@dineos.app?subject=Multi-Outlet%20%2F%20Franchise%20Inquiry&body=Hello%2C%20We%20operate%20multiple%20restaurant%20locations%20and%20would%20like%20to%20discuss%20multi-branch%20management.%0A%0ABrand%20Name%3A%0ANumber%20of%20Outlets%3A%0ACities%3A",
    },
  ];

  return (
    <section id="solutions" className="py-20 sm:py-28 bg-white text-stone-900 scroll-mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header with exact requested text */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 shadow-xs mb-4">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            Tailored Restaurant Technology
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-stone-900">
            Let's Build a <span className="text-emerald-600">Smarter Restaurant</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-stone-600 leading-relaxed">
            Every restaurant is different. Connect with us to discover the right solution for your business.
          </p>
        </div>

        {/* 3 Value Consultation Options */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <div
                key={opt.title}
                className="group relative flex flex-col justify-between rounded-3xl border border-stone-200/90 bg-stone-50/50 p-7 shadow-sm transition-all duration-300 hover:border-emerald-300 hover:bg-white hover:shadow-xl hover:-translate-y-1"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100/70 text-emerald-800 mb-5 border border-emerald-200/60 shadow-xs transition-transform group-hover:scale-105">
                    <Icon className="h-6 w-6 stroke-[2]" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-stone-900 group-hover:text-emerald-700 transition-colors">
                    {opt.title}
                  </h3>
                  <p className="mt-2 text-sm text-stone-600 leading-relaxed">
                    {opt.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-stone-200/60">
                  <a
                    href={opt.href}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors group-hover:translate-x-0.5"
                  >
                    <span>{opt.actionText}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dedicated Main Call-to-Action Bar */}
        <div className="mt-12 mx-auto max-w-3xl rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900 to-stone-950 p-8 text-center text-white shadow-xl border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h4 className="font-display text-xl font-bold text-white">
              Ready to modernize your dining experience?
            </h4>
            <p className="mt-1 text-xs text-stone-400">
              Our specialists respond in under 2 hours during active restaurant shifts.
            </p>
          </div>
          <a
            href="mailto:support@dineos.app?subject=Talk%20to%20Our%20Team%20-%20DineOS%20Inquiry"
            className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 px-7 text-sm font-bold text-stone-950 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PhoneCall className="h-4 w-4" />
            Talk to Our Team
          </a>
        </div>
      </div>
    </section>
  );
}
