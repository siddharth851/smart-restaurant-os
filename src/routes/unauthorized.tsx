import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/unauthorized")({
  head: () => ({
    meta: [
      { title: "Access Denied — Smart Restaurant OS" },
      { name: "description", content: "Your account doesn't have access to this area." },
      { property: "og:title", content: "Access Denied — Smart Restaurant OS" },
      { property: "og:description", content: "You don't have access to this page." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <AuthShell eyebrow="Access denied" title="You don't have access here" subtitle="Your account's role doesn't include this area. If you think this is a mistake, ask your restaurant owner.">
      <div className="flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-soft">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive"><ShieldAlert /></div>
        <div className="flex flex-wrap gap-2">
          <Button asChild><Link to="/login">Switch account</Link></Button>
          <Button asChild variant="outline"><Link to="/">Home</Link></Button>
        </div>
      </div>
    </AuthShell>
  ),
});
