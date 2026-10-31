import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CartProvider } from "@/lib/cart";

export const Route = createFileRoute("/menu/$restaurantSlug")({
  head: () => ({
    meta: [
      { title: "Menu & Table Ordering — Smart Restaurant OS" },
      { name: "description", content: "Browse the menu and order from your table." },
      { property: "og:title", content: "Restaurant Menu — Smart Restaurant OS" },
      { property: "og:description", content: "Scan, browse and order from your table." },
    ],
  }),
  component: () => (
    <CartProvider>
      <div className="mx-auto min-h-screen max-w-2xl bg-background lg:max-w-5xl">
        <Outlet />
      </div>
    </CartProvider>
  ),
});
