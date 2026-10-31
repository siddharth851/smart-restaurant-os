import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { loadAuthInfo } from "@/lib/auth";

// Session lives in browser storage, so the gate runs client-side only.
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const auth = await loadAuthInfo();
    if (!auth) throw redirect({ to: "/login", search: { redirect: location.href } });
    return { auth };
  },
  pendingComponent: () => (
    <div className="grid min-h-screen place-items-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  ),
  component: () => <Outlet />,
});
