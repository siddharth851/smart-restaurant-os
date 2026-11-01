import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, FieldError, FormAlert } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema } from "./register";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set New Password — Smart Restaurant OS" },
      { name: "description", content: "Choose a new password for your account." },
      { property: "og:title", content: "Reset Password — Smart Restaurant OS" },
      { property: "og:description", content: "Choose a new password." },
    ],
  }),
  component: Reset,
});

function Reset() {
  const navigate = useNavigate();
  const [ready, setReady] = useState<boolean | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const isRecovery = window.location.hash.includes("type=recovery");
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth
      .getSession()
      .then(({ data: s }) =>
        setReady((prev) => (isRecovery || s.session ? true : (prev ?? false))),
      );
    return () => data.subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    const parsed = registerSchema.shape.password.safeParse(password);
    const next: Record<string, string> = {};
    if (!parsed.success) next["password"] = parsed.error.issues[0]?.message ?? "Invalid password";
    if (password !== fd.get("confirm")) next["confirm"] = "Passwords don't match";
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return setFormError(error.message);
    setDone(true);
    await supabase.auth.signOut();
    setTimeout(() => navigate({ to: "/login" }), 1500);
  };

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Set a new password"
      footer={
        <Link to="/login" className="font-semibold text-primary">
          Back to sign in
        </Link>
      }
    >
      {done ? (
        <FormAlert tone="success">Password updated. Redirecting you to sign in…</FormAlert>
      ) : ready === false ? (
        <FormAlert tone="error">
          This reset link is invalid or has expired.{" "}
          <Link to="/forgot-password" className="font-semibold underline">
            Request a new one
          </Link>
          .
        </FormAlert>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          {formError && <FormAlert tone="error">{formError}</FormAlert>}
          <div>
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              className="mt-2 h-12"
            />
            <FieldError message={errors["password"]} />
          </div>
          <div>
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              className="mt-2 h-12"
            />
            <FieldError message={errors["confirm"]} />
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-12 w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20 text-sm transition-all active:scale-[0.99]"
            disabled={loading || ready === null}
          >
            {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
            {loading ? "Updating password…" : "Update Password"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
