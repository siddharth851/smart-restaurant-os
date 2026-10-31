import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Menu, X, UtensilsCrossed } from "lucide-react";

export function Navbar({ onOpenDemo }: { onOpenDemo?: () => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Solutions", href: "#solutions" },
    { label: "Reviews", href: "#testimonials" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md bg-stone-950/85 border-b border-white/10 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="group flex items-center gap-2.5 transition-transform hover:scale-[1.02]">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-md shadow-amber-500/20 text-stone-950">
              {/* Chef hat & dish stylized logo */}
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.69 2 6 4.69 6 8c0 .28.02.56.06.83A4.5 4.5 0 0 0 3 13c0 2.48 2.02 4.5 4.5 4.5h9c2.48 0 4.5-2.02 4.5-4.5 0-1.89-1.17-3.51-2.83-4.17.04-.27.06-.55.06-.83 0-3.31-2.69-6-6-6zm0 2c2.21 0 4 1.79 4 4 0 .3-.04.59-.11.87l-.4 1.59 1.48.71C18.15 11.75 19 12.8 19 14c0 1.66-1.34 3-3 3H8c-1.66 0-3-1.34-3-3 0-1.2.85-2.25 2.03-2.83l1.48-.71-.4-1.59C7.04 8.59 7 8.3 7 8c0-2.21 1.79-4 4-4zm-6 16v1c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-1H6z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl font-extrabold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                Dine<span className="text-amber-400">OS</span>
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-stone-400">
                Smart Restaurant OS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-stone-300 hover:text-white transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-emerald-400 hover:after:w-full after:transition-all after:duration-200"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {onOpenDemo && (
              <button
                onClick={onOpenDemo}
                className="inline-flex h-9.5 items-center gap-1.5 rounded-full px-4 text-xs font-semibold text-stone-300 hover:text-white hover:bg-white/10 transition-colors border border-white/10"
              >
                <UtensilsCrossed className="h-3.5 w-3.5 text-amber-400" />
                Live Panels
              </button>
            )}
            <Link
              to="/login"
              className="inline-flex h-9.5 items-center justify-center rounded-full border border-white/20 bg-white/5 px-5 text-xs font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/15 hover:border-white/30"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="inline-flex h-9.5 items-center justify-center gap-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 px-5 text-xs font-bold text-stone-950 shadow-md shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              to="/login"
              className="inline-flex h-8 items-center justify-center rounded-full border border-white/20 bg-white/5 px-3 text-xs font-semibold text-white"
            >
              Login
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-white/10 bg-stone-950/95 backdrop-blur-xl px-4 py-5 shadow-2xl transition-all animate-in fade-in slide-in-from-top-3">
          <div className="flex flex-col space-y-3">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-base font-medium text-stone-200 hover:bg-white/10 hover:text-white transition-colors"
              >
                {item.label}
                <ArrowRight className="h-4 w-4 text-stone-500" />
              </a>
            ))}

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
              {onOpenDemo && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenDemo();
                  }}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-sm font-semibold text-amber-300 hover:bg-amber-500/20"
                >
                  <UtensilsCrossed className="h-4 w-4" />
                  Explore Live Demo Panels
                </button>
              )}
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-11 items-center justify-center rounded-xl border border-white/20 bg-white/5 text-sm font-semibold text-white hover:bg-white/10"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-bold text-stone-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
