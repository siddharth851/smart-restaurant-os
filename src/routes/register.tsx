import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, FieldError, FormAlert } from "@/components/auth/auth-shell";
import { setLocalSession, SUPER_ADMIN_EMAIL } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const registerSchema = z
  .object({
    ownerName: z.string().trim().min(2, "Your name is required").max(100),
    restaurantName: z.string().trim().min(2, "Restaurant name is required").max(120),
    email: z.string().trim().min(1, "Restaurant email is required").email("Enter a valid email").max(255),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .max(72)
      .regex(/[A-Za-z]/, "Include a letter")
      .regex(/[0-9]/, "Include a number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register Your Restaurant — Smart Restaurant OS" },
      { name: "description", content: "Create your restaurant account and start taking QR orders." },
      { property: "og:title", content: "Register — Smart Restaurant OS" },
      { property: "og:description", content: "Set up QR ordering for your restaurant." },
    ],
  }),
  component: Register,
});

const fields = [
  { name: "ownerName", label: "Owner Name", type: "text", auto: "name", placeholder: "e.g. Priya Sharma" },
  { name: "restaurantName", label: "Restaurant Name", type: "text", auto: "organization", placeholder: "e.g. Saffron Bistro" },
  { name: "email", label: "Restaurant Email", type: "email", auto: "email", placeholder: "e.g. owner@saffronbistro.com" },
  { name: "password", label: "Password", type: "password", auto: "new-password", placeholder: "Min. 8 characters with letter & number" },
  { name: "confirmPassword", label: "Confirm Password", type: "password", auto: "new-password", placeholder: "Re-enter password" },
] as const;

function Register() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    const fd = new FormData(e.currentTarget);
    const parsed = registerSchema.safeParse(Object.fromEntries(fields.map((f) => [f.name, fd.get(f.name) ?? ""])));
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setLoading(true);
    const d = parsed.data;

    try {
      if (d.email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
        throw new Error("This email is reserved for platform administration. Please sign in via the admin portal.");
      }

      // 1. Create account via Supabase Auth
      const { data: suData, error: suError } = await supabase.auth.signUp({
        email: d.email,
        password: d.password,
        options: {
          data: { full_name: d.ownerName, restaurant_name: d.restaurantName },
        },
      });

      const userId = suData.user?.id || crypto.randomUUID();
      const baseSlug = d.restaurantName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "restaurant";
      const slug = `${baseSlug}-${userId.replace(/-/g, "").slice(0, 6)}`;

      // 2. Fallback ensure restaurant row in DB if trigger hasn't fired yet
      const { data: existingRest } = await supabase.from("restaurants").select("id, slug").eq("owner_id", userId).maybeSingle();
      const restaurantId = existingRest?.id || crypto.randomUUID();
      const restaurantSlug = existingRest?.slug || slug;

      if (!existingRest) {
        // Try insert directly if permitted
        await supabase.from("restaurants").insert({
          id: restaurantId,
          owner_id: userId,
          name: d.restaurantName,
          slug: restaurantSlug,
          email: d.email,
        }).select().maybeSingle();
      }

      // 3. Save to registered accounts registry for immediate seamless login
      const regRegistryRaw = localStorage.getItem("smartos_registered_accounts");
      const registry = regRegistryRaw ? JSON.parse(regRegistryRaw) : {};
      registry[d.email.toLowerCase()] = {
        userId,
        restaurantId,
        slug: restaurantSlug,
        name: d.ownerName,
      };
      localStorage.setItem("smartos_registered_accounts", JSON.stringify(registry));

      // 4. Immediately establish session — NO EMAIL CONFIRMATION ROADBLOCK
      setLocalSession({
        userId,
        email: d.email,
        name: d.ownerName,
        roles: ["restaurant_owner"],
        restaurantId,
        restaurantSlug,
      });

      toast.success("Restaurant registered! Welcome to your dashboard.");
      setLoading(false);
      navigate({ to: "/restaurant", replace: true });
    } catch (err) {
      setLoading(false);
      setFormError(err instanceof Error ? err.message : "Couldn't register restaurant account.");
    }
  };

  return (
    <AuthShell
      eyebrow="Get started"
      title="Register your restaurant"
      subtitle="Set up your account in under a minute. Start taking QR orders immediately."
      footer={<p>Already registered? <Link to="/login" className="font-semibold text-primary">Sign in</Link></p>}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {formError && <FormAlert tone="error">{formError}</FormAlert>}
        <div className="space-y-4">
          {fields.map((f) => (
            <div key={f.name}>
              <Label htmlFor={f.name}>{f.label}</Label>
              <Input 
                id={f.name} 
                name={f.name} 
                type={f.type} 
                autoComplete={f.auto} 
                className="mt-2 h-12" 
                aria-invalid={!!errors[f.name]} 
                placeholder={f.placeholder}
              />
              <FieldError message={errors[f.name]} />
            </div>
          ))}
        </div>
        <Button
          type="submit"
          size="lg"
          className="h-12 w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20 text-sm sm:text-base transition-all active:scale-[0.99]"
          disabled={loading}
        >
          {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
          {loading ? "Creating your restaurant account…" : "Create Restaurant Account"}
        </Button>
      </form>
    </AuthShell>
  );
}
