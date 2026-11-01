import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { categoriesQuery, itemsQuery, useCategoryMutations } from "@/lib/restaurant-api";
import { WithOwnerRestaurant } from "@/components/admin/owner-restaurant";
import { PageHeader, Panel } from "@/components/shared/ui-bits";
import { FieldError } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const categoryName = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(60, "Keep it under 60 characters");

export const Route = createFileRoute("/_authenticated/restaurant/categories")({
  component: () => (
    <WithOwnerRestaurant>{(r) => <Categories restaurantId={r.id} />}</WithOwnerRestaurant>
  ),
});

function Categories({ restaurantId }: { restaurantId: string }) {
  const { data: cats, isLoading } = useQuery(categoriesQuery(restaurantId));
  const { data: items } = useQuery(itemsQuery(restaurantId));
  const m = useCategoryMutations(restaurantId);
  const [newErr, setNewErr] = useState<string>();
  const [editing, setEditing] = useState<{ id: string; name: string } | null>(null);
  const [editErr, setEditErr] = useState<string>();
  const [toDelete, setToDelete] = useState<{ id: string; name: string } | null>(null);

  const onAdd = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const p = categoryName.safeParse(new FormData(form).get("name"));
    if (!p.success) return setNewErr(p.error.issues[0]?.message);
    if (cats?.some((c) => c.name.toLowerCase() === p.data.toLowerCase()))
      return setNewErr("A category with this name already exists");
    setNewErr(undefined);
    try {
      await m.create.mutateAsync(p.data);
      form.reset();
      toast.success(`Added "${p.data}"`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't add category");
    }
  };

  const onSave = async () => {
    if (!editing) return;
    const p = categoryName.safeParse(editing.name);
    if (!p.success) return setEditErr(p.error.issues[0]?.message);
    setEditErr(undefined);
    try {
      await m.update.mutateAsync({ id: editing.id, name: p.data });
      setEditing(null);
      toast.success("Category renamed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't rename category");
    }
  };

  const onDelete = async () => {
    if (!toDelete) return;
    try {
      await m.remove.mutateAsync(toDelete.id);
      toast.success(`Deleted "${toDelete.name}"`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't delete category");
    } finally {
      setToDelete(null);
    }
  };

  return (
    <>
      <PageHeader title="Categories" description="Group dishes into sections on your menu." />
      <Panel className="mb-6">
        <form
          onSubmit={onAdd}
          noValidate
          className="flex flex-col gap-2 sm:flex-row sm:items-start"
        >
          <div className="flex-1">
            <Input
              name="name"
              placeholder="e.g. Starters"
              className="h-11"
              aria-label="New category name"
              aria-invalid={!!newErr}
            />
            <FieldError message={newErr} />
          </div>
          <Button
            type="submit"
            className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-xs px-5"
            disabled={m.create.isPending}
          >
            {m.create.isPending ? (
              <Loader2 className="animate-spin h-4 w-4 mr-1.5" />
            ) : (
              <Plus className="h-4 w-4 mr-1.5" />
            )}
            Add Category
          </Button>
        </form>
      </Panel>
      <Panel>
        {isLoading ? (
          <div className="grid place-items-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : !cats?.length ? (
          <p className="py-10 text-center text-sm text-stone-500">
            No categories created yet. Add your first section above.
          </p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {cats.map((c) => {
              const n = items?.filter((i) => i.category_id === c.id).length ?? 0;
              const isEditing = editing?.id === c.id;
              return (
                <li key={c.id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                  {isEditing ? (
                    <div className="min-w-0 flex-1">
                      <Input
                        autoFocus
                        value={editing.name}
                        onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") onSave();
                          if (e.key === "Escape") setEditing(null);
                        }}
                        className="h-10 rounded-xl"
                        aria-label="Category name"
                      />
                      <FieldError message={editErr} />
                    </div>
                  ) : (
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display font-bold text-sm text-stone-900">
                        {c.name}
                      </p>
                      <p className="text-xs text-stone-500 mt-0.5">
                        <span className="inline-block rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600 mr-2">
                          {n} {n === 1 ? "dish" : "dishes"}
                        </span>
                        Visible on customer QR menu
                      </p>
                    </div>
                  )}
                  {isEditing ? (
                    <>
                      <Button
                        size="icon"
                        onClick={onSave}
                        disabled={m.update.isPending}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white"
                        aria-label="Save"
                      >
                        {m.update.isPending ? (
                          <Loader2 className="animate-spin h-4 w-4" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditing(null)}
                        className="rounded-xl text-stone-500"
                        aria-label="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditErr(undefined);
                          setEditing({ id: c.id, name: c.name });
                        }}
                        className="rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                        aria-label={`Rename ${c.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setToDelete({ id: c.id, name: c.name })}
                        className="rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        aria-label={`Delete ${c.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{toDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Dishes in this category stay on your menu but become uncategorised.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
