import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import heroBg from "@/assets/hero-restaurant-bg.jpg";

export function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32 text-white bg-stone-950">
      {/* Background Image with Dark Warm Overlay */}
      <img
        src={heroBg}
        alt="Restaurant Atmosphere"
        className="absolute inset-0 h-full w-full object-cover opacity-25 brightness-75 scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/85 to-stone-950/90" />

      {/* Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
          Ready to Transform Your Restaurant?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-stone-300 leading-relaxed">
          Join hundreds of restaurant owners who are already serving smarter with DineOS. Cut wait times, eliminate order errors, and boost table turnover today.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 px-8 text-sm font-bold text-stone-950 shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started Now
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/login"
            className="flex h-12 w-full sm:w-auto items-center justify-center rounded-full border border-white/20 bg-white/5 hover:bg-white/10 px-8 text-sm font-semibold text-white backdrop-blur-xs transition-colors"
          >
            Sign In to Dashboard
          </Link>
        </div>

        {/* Feature Checkpoints */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-stone-400 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Free 14-day setup
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Works on any smartphone
          </span>
        </div>
      </div>
    </section>
  );
}
