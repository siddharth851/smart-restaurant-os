import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const Route = createFileRoute("/login")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Restaurant Owner Login — Smart Restaurant OS" },
      { name: "description", content: "Sign in to manage your restaurant's orders, menu and tables." },
      { property: "og:title", content: "Owner Login — Smart Restaurant OS" },
      { property: "og:description", content: "Sign in to your restaurant dashboard." },
    ],
  }),
  component: OwnerLogin,
});

function OwnerLogin() {
  const { redirect } = Route.useSearch();
  return (
    <AuthShell
      eyebrow="Restaurant owners"
      title="Welcome back"
      subtitle="Sign in to your restaurant dashboard."
      footer={
        <p>New to Smart Restaurant OS? <Link to="/register" className="font-semibold text-primary">Register your restaurant</Link></p>
      }
    >
      <LoginForm
        allowed={["restaurant_owner"]}
        wrongPortalHint="This account is not registered as a restaurant owner. Please check your credentials or register your restaurant."
        redirectTo={redirect}
      />
    </AuthShell>
  );
}
