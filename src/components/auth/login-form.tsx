import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { 
  hasAnyRole, 
  homeForRoles, 
  loadAuthInfo, 
  safeRedirect, 
  setLocalSession, 
  SUPER_ADMIN_EMAIL, 
  SUPER_ADMIN_ID, 
  type AppRole 
} from "@/lib/auth";
import { authenticateSuperAdminServer } from "@/lib/admin.server";
import { confirmUserServerFn } from "@/lib/auth.server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError, FormAlert } from "./auth-shell";

const schema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email").max(255),
  password: z.string().min(1, "Password is required").max(72),
});

export function LoginForm({ allowed, wrongPortalHint, redirectTo }: { allowed: AppRole[]; wrongPortalHint: string; redirectTo?: string | undefined }) {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({ email: fd.get("email"), password: fd.get("password") });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setLoading(true);

    const { email, password } = parsed.data;

    // 1. Authenticate Super Admin (ONLY on Super Admin portal)
    if (allowed.length === 1 && allowed[0] === "super_admin") {
      try {
        const res = await authenticateSuperAdminServer({ data: { email, password } });
        if (res.ok && res.user) {
          setLocalSession({
            userId: res.user.id,
            email: res.user.email,
            name: res.user.name,
            roles: ["super_admin"],
          });
          setLoading(false);
          navigate({ to: "/super-admin", replace: true });
          return;
        } else {
          setLoading(false);
          setFormError(res.error || "Invalid administrator credentials.");
          return;
        }
      } catch (err) {
        setLoading(false);
        setFormError("Platform authentication error. Please try again.");
        return;
      }
    }

    // 2. Authenticate Restaurant Owner via Supabase Auth
    try {
      let { data: suData, error: suError } = await supabase.auth.signInWithPassword({ email, password });
      
      // Auto-confirm existing unconfirmed accounts server-side without user intervention
      if (suError && suError.message.toLowerCase().includes("email not confirmed")) {
        try {
          const conf = await confirmUserServerFn({ data: { email } });
          if (conf.ok) {
            const retry = await supabase.auth.signInWithPassword({ email, password });
            suData = retry.data;
            suError = retry.error;
          }
        } catch {
          // Continue to error display if server confirm fails
        }
      }

      if (suError) {
        setLoading(false);
        setFormError(suError.message || "Incorrect email or password.");
        return;
      }

      if (suData.user) {
        // Clear old local session so stale storage never overrides real Supabase user
        setLocalSession(null);

        // Look up the restaurant owned by this authenticated user
        const { data: rest } = await supabase
          .from("restaurants")
          .select("id, name, slug")
          .eq("owner_id", suData.user.id)
          .limit(1)
          .maybeSingle();

        // Establish verified session with genuine Supabase user ID and restaurant ID
        setLocalSession({
          userId: suData.user.id,
          email: suData.user.email ?? email,
          name: (suData.user.user_metadata?.full_name as string) || rest?.name || "Restaurant Owner",
          roles: ["restaurant_owner"],
          restaurantId: rest?.id,
          restaurantSlug: rest?.slug,
        });

        const target = safeRedirect(redirectTo) ?? "/restaurant";
        navigate({ to: target, replace: true });
        return;
      }
    } catch (err) {
      setLoading(false);
      setFormError(err instanceof Error ? err.message : "Authentication error. Please check your credentials.");
      return;
    }

    setLoading(false);
    setFormError("Incorrect email or password, or account is not registered as a restaurant owner.");
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {formError && <FormAlert tone="error">{formError}</FormAlert>}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          name="email" 
          type="email" 
          autoComplete="email" 
          className="mt-2 h-12" 
          aria-invalid={!!errors["email"]} 
          placeholder="your@email.com"
        />
        <FieldError message={errors["email"]} />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link to="/forgot-password" className="text-xs font-semibold text-primary">Forgot password?</Link>
        </div>
        <Input 
          id="password" 
          name="password" 
          type="password" 
          autoComplete="current-password" 
          className="mt-2 h-12" 
          aria-invalid={!!errors["password"]} 
          placeholder="••••••••"
        />
        <FieldError message={errors["password"]} />
      </div>
      <Button
        type="submit"
        size="lg"
        className="h-12 w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20 text-sm sm:text-base transition-all active:scale-[0.99]"
        disabled={loading}
      >
        {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
        {loading ? "Signing in…" : "Sign in to Dashboard"}
      </Button>
    </form>
  );
}
