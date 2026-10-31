import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { hasAnyRole, PANEL_ROLES } from "@/lib/auth";
import { uploadImage, useUpdateRestaurant } from "@/lib/restaurant-api";
import { ImageField, WithOwnerRestaurant } from "@/components/admin/owner-restaurant";
import { PageHeader, Panel } from "@/components/shared/ui-bits";
import { FieldError } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Restaurant name is required").max(120),
  description: z.string().trim().max(200, "Keep it under 200 characters"),
  address: z.string().trim().max(300),
  phone: z.string().trim().regex(/^(\+?[0-9\s-]{8,16})?$/, "Enter a valid phone number"),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email").max(255)]),
});

export const Route = createFileRoute("/_authenticated/restaurant/settings")({
  beforeLoad: ({ context }) => {
    if (!hasAnyRole(context.auth.roles, [...PANEL_ROLES.restaurantOwnerOnly])) throw redirect({ to: "/unauthorized" });
  },
  component: () => (
    <WithOwnerRestaurant>{(r, userId) => <SettingsForm key={r.id} r={r} userId={userId} />}</WithOwnerRestaurant>
  ),
});

type R = Parameters<Parameters<typeof WithOwnerRestaurant>[0]["children"]>[0];

function SettingsForm({ r, userId }: { r: R; userId: string }) {
  const update = useUpdateRestaurant(userId);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [logo, setLogo] = useState<{ file: File | null; preview: string | null; cleared: boolean }>({ file: null, preview: r.logoSrc, cleared: false });
  const [cover, setCover] = useState<{ file: File | null; preview: string | null; cleared: boolean }>({ file: null, preview: r.coverSrc, cleared: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => () => {
    if (logo.file && logo.preview) URL.revokeObjectURL(logo.preview);
    if (cover.file && cover.preview) URL.revokeObjectURL(cover.preview);
  }, [logo, cover]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = profileSchema.safeParse(Object.fromEntries(["name", "description", "address", "phone", "email"].map((k) => [k, String(fd.get(k) ?? "")])));
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const logo_url = logo.file ? await uploadImage(r.id, "brand", logo.file) : logo.cleared ? null : r.logo_url;
      const cover_url = cover.file ? await uploadImage(r.id, "brand", cover.file) : cover.cleared ? null : r.cover_url;
      const v = parsed.data;
      await update.mutateAsync({
        id: r.id,
        values: { name: v.name, description: v.description || null, address: v.address || null, phone: v.phone || null, email: v.email || null, logo_url, cover_url },
      });
      toast.success("Restaurant profile saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save changes");
    } finally {
      setSaving(false);
    }
  };

  const pick = (set: typeof setLogo) => (file: File) => set({ file, preview: URL.createObjectURL(file), cleared: false });
  const clear = (set: typeof setLogo) => () => set({ file: null, preview: null, cleared: true });

  return (
    <form onSubmit={onSubmit} noValidate>
      <PageHeader
        title="Restaurant profile"
        description="What guests see at the top of your menu."
        actions={
          <>
            <Button asChild variant="outline" className="rounded-xl border-stone-200 hover:bg-stone-100 font-semibold text-xs sm:text-sm">
              <Link to="/menu/$restaurantSlug" params={{ restaurantSlug: r.slug }} target="_blank">
                <ExternalLink className="h-4 w-4 mr-1.5" /> View Live Menu
              </Link>
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-xs text-xs sm:text-sm px-5"
            >
              {saving && <Loader2 className="animate-spin h-4 w-4 mr-1.5" />}
              {saving ? "Saving profile…" : "Save Profile Changes"}
            </Button>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Details" className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="name" label="Restaurant name" defaultValue={r.name} error={errors["name"]} className="sm:col-span-2" />
            <Field name="description" label="Tagline" defaultValue={r.description ?? ""} placeholder="Modern Indian kitchen" error={errors["description"]} className="sm:col-span-2" />
            <Field name="phone" label="Phone" type="tel" defaultValue={r.phone ?? ""} error={errors["phone"]} />
            <Field name="email" label="Contact email" type="email" defaultValue={r.email ?? ""} error={errors["email"]} />
            <div className="sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" name="address" defaultValue={r.address ?? ""} className="mt-2" rows={3} />
              <FieldError message={errors["address"]} />
            </div>
            <div className="sm:col-span-2 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
              Menu link: <span className="font-mono text-foreground">/menu/{r.slug}</span>
            </div>
          </div>
        </Panel>
        <Panel title="Branding">
          <div className="space-y-5">
            <ImageField label="Logo" previewSrc={logo.preview} onPick={pick(setLogo)} onClear={clear(setLogo)} />
            <ImageField label="Cover image" aspect="wide" previewSrc={cover.preview} onPick={pick(setCover)} onClear={clear(setCover)} />
          </div>
        </Panel>
      </div>
    </form>
  );
}

function Field({ name, label, error, className, ...rest }: { name: string; label: string; error?: string | undefined; className?: string; defaultValue?: string; type?: string; placeholder?: string }) {
  return (
    <div className={className}>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} className="mt-2 h-11" aria-invalid={!!error} {...rest} />
      <FieldError message={error} />
    </div>
  );
}
