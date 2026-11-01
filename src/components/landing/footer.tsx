import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer id="contact" className="bg-stone-950 text-stone-400 border-t border-stone-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.69 2 6 4.69 6 8c0 .28.02.56.06.83A4.5 4.5 0 0 0 3 13c0 2.48 2.02 4.5 4.5 4.5h9c2.48 0 4.5-2.02 4.5-4.5 0-1.89-1.17-3.51-2.83-4.17.04-.27.06-.55.06-.83 0-3.31-2.69-6-6-6zm0 2c2.21 0 4 1.79 4 4 0 .3-.04.59-.11.87l-.4 1.59 1.48.71C18.15 11.75 19 12.8 19 14c0 1.66-1.34 3-3 3H8c-1.66 0-3-1.34-3-3 0-1.2.85-2.25 2.03-2.83l1.48-.71-.4-1.59C7.04 8.59 7 8.3 7 8c0-2.21 1.79-4 4-4zm-6 16v1c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-1H6z" />
                </svg>
              </div>
              <span className="font-display text-xl font-extrabold text-white">
                Dine<span className="text-amber-400">OS</span>
              </span>
            </Link>
            <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
              A smarter way to serve. The complete restaurant operating system for QR ordering,
              real-time kitchen displays, and effortless table management.
            </p>
            <div className="pt-2">
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                ● Systems Operational (99.98% Uptime)
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Product</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#home" className="hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#solutions" className="hover:text-white transition-colors">
                  Solutions
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-white transition-colors">
                  Customer Stories
                </a>
              </li>
            </ul>
          </div>

          {/* Live Panels */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Live Panels</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/menu/$restaurantSlug"
                  params={{ restaurantSlug: "saffron-table" }}
                  className="hover:text-white transition-colors"
                >
                  Guest QR Menu
                </Link>
              </li>
              <li>
                <Link to="/kitchen" className="hover:text-white transition-colors">
                  Kitchen Display (KDS)
                </Link>
              </li>
              <li>
                <Link to="/restaurant" className="hover:text-white transition-colors">
                  Restaurant Dashboard
                </Link>
              </li>
              <li>
                <Link to="/platform" className="hover:text-white transition-colors">
                  Platform Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Account & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Access & Help</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Register Restaurant
                </Link>
              </li>
              <li>
                <Link to="/staff/login" className="hover:text-white transition-colors">
                  Staff Login
                </Link>
              </li>
              <li>
                <a href="mailto:support@dineos.app" className="hover:text-white transition-colors">
                  support@dineos.app
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-stone-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 DineOS · Smart Restaurant OS. All rights reserved.</p>
          <div className="flex items-center gap-4 text-stone-400">
            <span>Built for high-volume modern dining</span>
            <span>•</span>
            <span>Made in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
