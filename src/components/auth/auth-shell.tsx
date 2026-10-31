import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import heroBg from "@/assets/hero-restaurant-bg.jpg";
import { Sparkles, ShieldCheck, Zap } from "lucide-react";

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-stone-50 lg:grid-cols-[1.1fr_1fr] selection:bg-emerald-500 selection:text-stone-950">
      {/* Left Ambient Showcase Pane */}
      <aside className="relative hidden overflow-hidden bg-stone-950 text-white lg:flex lg:flex-col lg:justify-between p-12 lg:p-16">
        {/* Background Image with Rich Deep Tint */}
        <img
          src={heroBg}
          alt="Restaurant Ambiance"
          className="absolute inset-0 h-full w-full object-cover opacity-25 brightness-75 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-stone-950/70" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Brand Logo */}
        <div className="relative z-10">
          <Link to="/" className="group inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 shadow-lg shadow-amber-500/20">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.69 2 6 4.69 6 8c0 .28.02.56.06.83A4.5 4.5 0 0 0 3 13c0 2.48 2.02 4.5 4.5 4.5h9c2.48 0 4.5-2.02 4.5-4.5 0-1.89-1.17-3.51-2.83-4.17.04-.27.06-.55.06-.83 0-3.31-2.69-6-6-6zm0 2c2.21 0 4 1.79 4 4 0 .3-.04.59-.11.87l-.4 1.59 1.48.71C18.15 11.75 19 12.8 19 14c0 1.66-1.34 3-3 3H8c-1.66 0-3-1.34-3-3 0-1.2.85-2.25 2.03-2.83l1.48-.71-.4-1.59C7.04 8.59 7 8.3 7 8c0-2.21 1.79-4 4-4zm-6 16v1c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-1H6z" />
              </svg>
            </div>
            <div>
              <span className="font-display text-xl font-extrabold tracking-tight text-white">
                Dine<span className="text-amber-400">OS</span>
              </span>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                Smart Restaurant OS
              </p>
            </div>
          </Link>
        </div>

        {/* Middle Feature Highlights */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            Hospitality Operating System
          </div>
          <h2 className="font-display text-3xl xl:text-4xl font-extrabold leading-tight text-white">
            Every table, every order, one calm system.
          </h2>
          <p className="text-sm text-stone-300 leading-relaxed">
            Eliminate chaotic handwritten tickets and wait times. Built for high-volume dining rooms, busy kitchens, and multi-location managers.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2.5 text-xs text-stone-300">
              <Zap className="h-4 w-4 text-emerald-400" />
              <span>Realtime KDS Tickets</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-stone-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>99.98% System Uptime</span>
            </div>
          </div>
        </div>

        {/* Bottom Status Tag */}
        <div className="relative z-10 text-xs text-stone-500 flex items-center justify-between">
          <span>Trusted by 500+ restaurants across India</span>
          <span className="text-emerald-400 font-semibold">● Live Cloud Active</span>
        </div>
      </aside>

      {/* Right Form Main Area */}
      <main className="flex min-h-screen flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-white">
        {/* Mobile Header Logo */}
        <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 font-display text-xs font-black shadow-md">
            DO
          </div>
          <span className="font-display text-base font-extrabold text-stone-900">
            Dine<span className="text-amber-500">OS</span>
          </span>
        </Link>

        {/* Form Container */}
        <div className="mx-auto w-full max-w-md">
          <div className="mb-6">
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 mb-2">
              {eyebrow}
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          <div className="mt-6 rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
            {children}
          </div>

          {footer && (
            <div className="mt-6 text-center text-xs text-stone-600 space-y-1">
              {footer}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs font-semibold text-rose-600 flex items-center gap-1">{message}</p>;
}

export function FormAlert({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: ReactNode;
}) {
  return (
    <div
      role="alert"
      className={
        tone === "error"
          ? "rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs sm:text-sm font-medium text-rose-800"
          : "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs sm:text-sm font-medium text-emerald-800"
      }
    >
      {children}
    </div>
  );
}
