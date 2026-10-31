import { createFileRoute } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const Route = createFileRoute("/super-admin/login")({
  head: () => ({
    meta: [
      { title: "Super Admin Login — Smart Restaurant OS" },
      { name: "description", content: "Platform owner authentication." },
      { property: "og:title", content: "Super Admin — Smart Restaurant OS" },
      { property: "og:description", content: "Platform owner console sign-in." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <AuthShell
      eyebrow="Platform Owner"
      title="Super Admin Portal"
      subtitle="Restricted access for platform owner to manage all restaurants."
    >
      <LoginForm
        allowed={["super_admin"]}
        wrongPortalHint="This account does not have Super Admin platform access."
      />
    </AuthShell>
  ),
});
