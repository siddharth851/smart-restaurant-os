import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Play, Utensils, Star, ShieldCheck, ShoppingBag } from "lucide-react";
import heroBg from "@/assets/hero-restaurant-bg.jpg";
import { Navbar } from "@/components/landing/navbar";
import { HeroPhoneMockup } from "@/components/landing/hero-phone-mockup";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { ConsultationSection } from "@/components/landing/consultation-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";
import { Footer } from "@/components/landing/footer";
import { DemoModal } from "@/components/landing/demo-modal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DineOS — Smart Restaurant OS | QR Menu, Kitchen Display & Management" },
      {
        name: "description",
        content:
          "Scan. Order. Serve. Modern QR menu, real-time kitchen updates, and powerful restaurant management — all in one simple platform.",
      },
      { property: "og:title", content: "DineOS — Smart Restaurant OS" },
      {
        property: "og:description",
        content:
          "Modern QR menu, real-time kitchen display, and table management for high-performing restaurants.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const [demoOpen, setDemoOpen] = useState(false);

  const stats = [
    { label: "Restaurants", value: "500+", icon: Utensils },
    { label: "Orders Served", value: "2M+", icon: ShoppingBag },
    { label: "Uptime", value: "99%", icon: ShieldCheck },
    { label: "User Rating", value: "4.9★", icon: Star },
  ];

  return (
    <div id="home" className="min-h-screen bg-stone-950 text-stone-100 overflow-x-hidden selection:bg-emerald-500 selection:text-stone-950">
      {/* 1. Sticky Navigation */}
      <Navbar onOpenDemo={() => setDemoOpen(true)} />

      {/* 2. Hero Section */}
      <section className="relative min-h-[92vh] pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden flex flex-col justify-center">
        {/* Background Atmosphere Image */}
        <img
          src={heroBg}
          alt="Warm Restaurant Atmosphere"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-30 brightness-[0.7] scale-105"
        />

        {/* Ambient Dark Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/85 to-stone-950/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/80" />

        {/* Subtle Radial Glows for Cinematic Vibe */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Content Column (7 cols on desktop) */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              {/* Pill Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 backdrop-blur-md shadow-xs mb-6">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Smart Restaurant OS
              </div>

              {/* Main Headline */}
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-[64px] font-extrabold tracking-tight text-white leading-[1.1]">
                Scan. Order. Serve. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-stone-100 to-stone-300">
                  One System for
                </span>{" "}
                <span className="text-amber-400">Every Table.</span>
              </h1>

              {/* Description */}
              <p className="mt-6 max-w-xl text-base sm:text-lg text-stone-300 leading-relaxed">
                Modern QR menu, real-time kitchen updates, and powerful restaurant management — all in one simple platform.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4 w-full sm:w-auto">
                <Link
                  to="/register"
                  className="flex h-12 w-full sm:w-auto items-center justify-center gap-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 px-7 text-sm font-bold text-stone-950 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => setDemoOpen(true)}
                  className="flex h-12 w-full sm:w-auto items-center justify-center gap-2.5 rounded-full border border-white/20 bg-stone-900/80 hover:bg-stone-800 px-6 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white/40"
                >
                  <Play className="h-4 w-4 text-amber-400 fill-amber-400" />
                  Watch Demo
                </button>
              </div>

              {/* Desktop Stat Counters Bar */}
              <div className="hidden lg:grid mt-12 pt-8 border-t border-white/10 w-full grid-cols-4 gap-6">
                {stats.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-900/90 border border-white/10 text-amber-400">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <p className="font-display text-lg sm:text-xl font-extrabold text-white leading-tight">
                          {s.value}
                        </p>
                        <p className="text-[11px] font-medium text-stone-400">
                          {s.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Visual Column (5 cols on desktop) */}
            <div className="lg:col-span-5 w-full flex justify-center">
              <HeroPhoneMockup />
            </div>
          </div>

          {/* Mobile Stat Counters Bar (shown below phone on mobile/tablet) */}
          <div className="lg:hidden mt-10 pt-6 border-t border-white/10 w-full grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-900/90 border border-white/10 text-amber-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-display text-base font-extrabold text-white leading-tight">
                      {s.value}
                    </p>
                    <p className="text-[10px] font-medium text-stone-400">
                      {s.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <FeaturesSection />

      {/* 4. How It Works Section */}
      <HowItWorksSection />

      {/* 5. Consultation / Solutions Section (Replaced Pricing completely) */}
      <ConsultationSection />

      {/* 6. Testimonials Section */}
      <TestimonialsSection />

      {/* 7. Final Call to Action */}
      <FinalCtaSection />

      {/* 8. Footer */}
      <Footer />

      {/* 9. Live Demo Dialog */}
      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
