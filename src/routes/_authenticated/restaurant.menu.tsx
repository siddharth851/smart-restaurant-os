import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, type FormEvent } from "react";
import { Loader2, Pencil, Plus, Search, Trash2, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { formatINR } from "@/lib/demo-data";
import { categoriesQuery, itemsQuery, uploadImage, useItemMutations, type CategoryRow, type OwnerItem } from "@/lib/restaurant-api";
import { ImageField, WithOwnerRestaurant } from "@/components/admin/owner-restaurant";
import { PageHeader, Panel, VegMark } from "@/components/shared/ui-bits";
import { FieldError } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export const itemSchema = z.object({
  name: z.string().trim().min(1, "Dish name is required").max(100),
  description: z.string().trim().max(500, "Keep it under 500 characters"),
  price: z.coerce.number({ invalid_type_error: "Enter a price" }).min(0, "Price can't be negative").max(1_000_000, "Price is too high")
    .refine((n) => Math.round(n * 100) === n * 100, "Use at most 2 decimals"),
});

export const Route = createFileRoute("/_authenticated/restaurant/menu")({
  component: () => <WithOwnerRestaurant>{(r) => <MenuManager restaurantId={r.id} slug={r.slug} />}</WithOwnerRestaurant>,
});

type Item = OwnerItem;

function MenuManager({ restaurantId, slug }: { restaurantId: string; slug: string }) {
  const { data: items, isLoading, isError, error } = useQuery(itemsQuery(restaurantId));
  const { data: cats = [] } = useQuery(categoriesQuery(restaurantId));
  const m = useItemMutations(restaurantId);
  const [editing, setEditing] = useState<Item | "new" | null>(null);
  const [toDelete, setToDelete] = useState<Item | null>(null);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");

  const list = useMemo(
    () => (items ?? []).filter((i) => (cat === "all" || (cat === "none" ? !i.category_id : i.category_id === cat)) && i.name.toLowerCase().includes(q.trim().toLowerCase())),
    [items, q, cat],
  );

  const toggle = async (i: Item, v: boolean) => {
    try {
      await m.toggle.mutateAsync({ id: i.id, is_available: v });
      toast.success(`${i.name} is ${v ? "available" : "out of stock"}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update availability");
    }
  };

  return (
    <>
      <PageHeader
        title="Menu Management"
        description={items ? `${items.length} dish${items.length === 1 ? "" : "es"} across ${cats.length} categor${cats.length === 1 ? "y" : "ies"}` : undefined}
        actions={
          <>
            <Button asChild variant="outline" className="rounded-xl border-stone-200 hover:bg-stone-100 font-semibold text-xs sm:text-sm">
              <Link to="/menu/$restaurantSlug" params={{ restaurantSlug: slug }} target="_blank">
                View Live Menu
              </Link>
            </Button>
            <Button
              onClick={() => setEditing("new")}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-xs text-xs sm:text-sm"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Dish
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search dishes" className="h-11 pl-9" />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="h-11 sm:w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            <SelectItem value="none">Uncategorised</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : isError ? (
        <Panel><p className="text-sm text-destructive">Couldn't load dishes: {error.message}</p></Panel>
      ) : !items?.length ? (
        <Panel>
          <div className="py-10 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-accent text-accent-foreground"><UtensilsCrossed /></div>
            <p className="mt-3 font-semibold">No dishes yet</p>
            <p className="text-sm text-muted-foreground">{cats.length ? "Add your first dish to publish your menu." : <>Start by <Link to="/restaurant/categories" className="font-semibold text-primary">creating a category</Link>, then add dishes.</>}</p>
            <Button className="mt-4" onClick={() => setEditing("new")}><Plus /> Add dish</Button>
          </div>
        </Panel>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((i) => (
            <div
              key={i.id}
              className={cn(
                "group flex flex-col justify-between overflow-hidden rounded-3xl border border-stone-200/90 bg-white shadow-xs transition-all duration-200 hover:shadow-lg hover:border-stone-300",
                !i.is_available && "opacity-75 bg-stone-50/60",
              )}
            >
              <div>
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
                  {i.imageSrc ? (
                    <img
                      src={i.imageSrc}
                      alt={i.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-stone-100 text-stone-400">
                      <UtensilsCrossed className="h-8 w-8" />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold text-stone-800 shadow-xs">
                    {cats.find((c) => c.id === i.category_id)?.name ?? "Uncategorised"}
                  </span>
                  {!i.is_available && (
                    <span className="absolute top-3 right-3 rounded-full bg-stone-900/90 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold text-rose-300 shadow-xs">
                      Out of Stock
                    </span>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2">
                    <VegMark veg={i.is_veg} />
                    <h3 className="truncate font-display text-base font-bold text-stone-900">{i.name}</h3>
                  </div>
                  <p className="mt-1 line-clamp-2 min-h-8 text-xs text-stone-500 leading-relaxed">
                    {i.description || "No description provided."}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between gap-2">
                <span className="font-display text-base font-extrabold text-stone-900">
                  {formatINR(Number(i.price))}
                </span>
                <div className="flex items-center gap-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 bg-stone-50 px-2.5 py-1 rounded-xl border border-stone-200/60 cursor-pointer">
                    <Switch
                      checked={i.is_available}
                      onCheckedChange={(v) => toggle(i, v)}
                      aria-label={`${i.name} available`}
                    />
                    <span className="text-[11px]">{i.is_available ? "In Stock" : "86'd"}</span>
                  </label>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditing(i)}
                    aria-label={`Edit ${i.name}`}
                    className="h-8 w-8 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setToDelete(i)}
                    aria-label={`Delete ${i.name}`}
                    className="h-8 w-8 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {list.length === 0 && (
            <div className="py-16 text-center text-sm text-stone-400 sm:col-span-2 xl:col-span-3">
              No dishes match your filter criteria.
            </div>
          )}
        </div>
      )}

      <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader><SheetTitle>{editing === "new" ? "Add dish" : "Edit dish"}</SheetTitle></SheetHeader>
          {editing && (
            <ItemForm
              key={editing === "new" ? "new" : editing.id}
              item={editing === "new" ? null : editing}
              cats={cats}
              restaurantId={restaurantId}
              onDone={() => setEditing(null)}
            />
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{toDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>This removes the dish from your menu permanently.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!toDelete) return;
                try {
                  await m.remove.mutateAsync(toDelete.id);
                  toast.success(`Deleted ${toDelete.name}`);
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Couldn't delete dish");
                }
                setToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ItemForm({ item, cats, restaurantId, onDone }: { item: Item | null; cats: CategoryRow[]; restaurantId: string; onDone: () => void }) {
  const m = useItemMutations(restaurantId);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [veg, setVeg] = useState(item?.is_veg ?? true);
  const [available, setAvailable] = useState(item?.is_available ?? true);
  const [categoryId, setCategoryId] = useState<string>(item?.category_id ?? cats[0]?.id ?? "none");
  const [img, setImg] = useState<{ file: File | null; preview: string | null; cleared: boolean }>({ file: null, preview: item?.imageSrc ?? null, cleared: false });
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = { name: fd.get("name") ?? "", description: fd.get("description") ?? "", price: String(fd.get("price") ?? "").trim() };
    const parsed = itemSchema.safeParse({ ...raw, price: raw.price === "" ? undefined : raw.price });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const image_url = img.file ? await uploadImage(restaurantId, "items", img.file) : img.cleared ? null : (item?.image_url ?? null);
      await m.save.mutateAsync({
        id: item?.id,
        values: { ...parsed.data, is_veg: veg, is_available: available, category_id: categoryId === "none" ? null : categoryId, image_url },
      });
      toast.success(item ? "Dish updated" : "Dish added");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save dish");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5 px-4 pb-6">
      <ImageField
        label="Food photo"
        aspect="wide"
        previewSrc={img.preview}
        onPick={(file) => setImg({ file, preview: URL.createObjectURL(file), cleared: false })}
        onClear={() => setImg({ file: null, preview: null, cleared: true })}
      />
      <div>
        <Label htmlFor="name">Dish name</Label>
        <Input id="name" name="name" defaultValue={item?.name ?? ""} className="mt-2 h-11" aria-invalid={!!errors["name"]} />
        <FieldError message={errors["name"]} />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={item?.description ?? ""} rows={3} className="mt-2" />
        <FieldError message={errors["description"]} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="price">Price (₹)</Label>
          <Input id="price" name="price" type="number" inputMode="decimal" min="0" step="0.01" defaultValue={item ? String(item.price) : ""} className="mt-2 h-11" aria-invalid={!!errors["price"]} />
          <FieldError message={errors["price"]} />
        </div>
        <div>
          <Label>Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="mt-2 h-11" aria-label="Category"><SelectValue /></SelectTrigger>
            <SelectContent>
              {cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              <SelectItem value="none">Uncategorised</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Type</Label>
        <div className="mt-2 grid grid-cols-2 gap-2" role="radiogroup">
          {[{ v: true, l: "Veg" }, { v: false, l: "Non-veg" }].map((o) => (
            <button
              key={o.l}
              type="button"
              role="radio"
              aria-checked={veg === o.v}
              onClick={() => setVeg(o.v)}
              className={cn("flex h-11 items-center justify-center gap-2 rounded-lg border text-sm font-semibold", veg === o.v ? (o.v ? "border-success bg-success/10 text-success" : "border-destructive bg-destructive/10 text-destructive") : "bg-card text-muted-foreground")}
            >
              <VegMark veg={o.v} /> {o.l}
            </button>
          ))}
        </div>
      </div>
      <label className="flex items-center justify-between rounded-xl border p-3 text-sm">
        <span>Available to order</span>
        <Switch checked={available} onCheckedChange={setAvailable} />
      </label>
      <Button
        type="submit"
        size="lg"
        className="h-12 w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20 text-sm transition-all"
        disabled={saving}
      >
        {saving && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
        {saving ? "Saving dish…" : item ? "Save Changes" : "Create Dish"}
      </Button>
    </form>
  );
}
