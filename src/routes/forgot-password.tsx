import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, FieldError, FormAlert } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — Smart Restaurant OS" },
      { name: "description", content: "Reset the password for your Smart Restaurant OS account." },
      { property: "og:title", content: "Forgot Password — Smart Restaurant OS" },
      { property: "og:description", content: "Get a password reset link." },
    ],
  }),
  component: Forgot,
});

function Forgot() {
  const [error, setError] = useState<string>();
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = z.string().trim().email("Enter a valid email").safeParse(new FormData(e.currentTarget).get("email"));
    if (!parsed.success) return setError(parsed.error.issues[0]?.message);
    setError(undefined);
    setFormError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(parsed.data, { redirectTo: `${window.location.origin}/reset-password` });
    setLoading(false);
    if (err) return setFormError(err.message);
    setSent(true);
  };

  return (
    <AuthShell eyebrow="Account recovery" title="Forgot your password?" subtitle="We'll email you a secure link to set a new one." footer={<Link to="/login" className="font-semibold text-primary">Back to sign in</Link>}>
      {sent ? (
        <FormAlert tone="success">If an account exists for that email, a reset link is on its way.</FormAlert>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          {formError && <FormAlert tone="error">{formError}</FormAlert>}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" className="mt-2 h-12" />
            <FieldError message={error} />
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-12 w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20 text-sm transition-all active:scale-[0.99]"
            disabled={loading}
          >
            {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
            {loading ? "Sending reset link…" : "Send Reset Link"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
