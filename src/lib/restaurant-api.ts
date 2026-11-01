import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import * as demo from "./demo-data";

export type RestaurantRow = Database["public"]["Tables"]["restaurants"]["Row"];
export type CategoryRow = Database["public"]["Tables"]["menu_categories"]["Row"];
export type ItemRow = Database["public"]["Tables"]["menu_items"]["Row"];
export type OwnerItem = ItemRow & { imageSrc: string | null };

const BUCKET = "restaurant-media";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/* ---------- media ---------- */

/** Images live in a private bucket; the *_url columns store the object path. */
export async function signPaths(
  paths: (string | null | undefined)[],
): Promise<Record<string, string>> {
  const unique = [...new Set(paths.filter((p): p is string => !!p && !p.startsWith("http")))];
  if (!unique.length) return {};
  const { data } = await supabase.storage.from(BUCKET).createSignedUrls(unique, 60 * 60 * 24 * 7);
  return Object.fromEntries(
    (data ?? []).filter((d) => d.signedUrl && d.path).map((d) => [d.path!, d.signedUrl as string]),
  );
}

export function validateImage(file: File): string | null {
  if (!IMAGE_TYPES.includes(file.type)) return "Use a JPG, PNG or WebP image";
  if (file.size > MAX_IMAGE_BYTES) return "Image must be 5 MB or smaller";
  return null;
}

export async function uploadImage(
  restaurantId: string,
  folder: string,
  file: File,
): Promise<string> {
  const err = validateImage(file);
  if (err) throw new Error(err);
  const ext =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${restaurantId}/${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return path;
}

import { getLocalSession, SUPER_ADMIN_ID } from "./auth";

/* ---------- owner restaurant ---------- */

export const myRestaurantQuery = (userId: string) =>
  queryOptions({
    queryKey: ["my-restaurant", userId],
    queryFn: async () => {
      // 1. Resolve true authenticated user ID from Supabase Auth
      let effectiveUserId = userId;
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user?.id) {
          effectiveUserId = authData.user.id;
        }
      } catch {
        // use parameter userId
      }

      // 2. Query restaurant where owner_id matches the authenticated user ID
      // eslint-disable-next-line prefer-const
      let { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("owner_id", effectiveUserId)
        .order("created_at")
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error querying restaurant by owner_id:", error);
      }

      const local = getLocalSession();
      const isSuperAdmin = userId === SUPER_ADMIN_ID || local?.roles.includes("super_admin");

      // 3. Fallback only for Super Admin inspecting the fleet
      if (!data && isSuperAdmin) {
        if (local?.restaurantId) {
          const res = await supabase
            .from("restaurants")
            .select("*")
            .eq("id", local.restaurantId)
            .maybeSingle();
          if (res.data) data = res.data;
        } else {
          const res = await supabase
            .from("restaurants")
            .select("*")
            .order("created_at")
            .limit(1)
            .maybeSingle();
          if (res.data) data = res.data;
        }
      }

      // Strict tenant isolation guard: an owner can never access another owner's restaurant
      if (data && !isSuperAdmin && data.owner_id !== effectiveUserId) {
        data = null;
      }

      if (!data) return null;
      const urls = await signPaths([data.logo_url, data.cover_url]);
      return {
        ...data,
        logoSrc: data.logo_url ? (urls[data.logo_url] ?? null) : null,
        coverSrc: data.cover_url ? (urls[data.cover_url] ?? null) : null,
        isSuspended: (data.description ?? "").includes("[SUSPENDED]"),
      };
    },
  });

export const useMyRestaurant = (userId: string) => useQuery(myRestaurantQuery(userId));

export type RestaurantUpdate = Pick<
  RestaurantRow,
  "name" | "address" | "phone" | "email" | "description" | "logo_url" | "cover_url"
>;

export function useUpdateRestaurant(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: RestaurantUpdate }) => {
      const { error } = await supabase.from("restaurants").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-restaurant", userId] });
      qc.invalidateQueries({ queryKey: ["public-menu"] });
    },
  });
}

/* ---------- categories ---------- */

export const categoriesQuery = (restaurantId: string) =>
  queryOptions({
    queryKey: ["categories", restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_categories")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("sort_order")
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });

export function useCategoryMutations(restaurantId: string) {
  const qc = useQueryClient();
  const done = () => {
    qc.invalidateQueries({ queryKey: ["categories", restaurantId] });
    qc.invalidateQueries({ queryKey: ["items", restaurantId] });
    qc.invalidateQueries({ queryKey: ["public-menu"] });
  };
  return {
    create: useMutation({
      mutationFn: async (name: string) => {
        const { count } = await supabase
          .from("menu_categories")
          .select("id", { count: "exact", head: true })
          .eq("restaurant_id", restaurantId);
        const { error } = await supabase
          .from("menu_categories")
          .insert({ restaurant_id: restaurantId, name, sort_order: count ?? 0 });
        if (error) throw error;
      },
      onSuccess: done,
    }),
    update: useMutation({
      mutationFn: async ({ id, name }: { id: string; name: string }) => {
        const { error } = await supabase.from("menu_categories").update({ name }).eq("id", id);
        if (error) throw error;
      },
      onSuccess: done,
    }),
    remove: useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase.from("menu_categories").delete().eq("id", id);
        if (error) throw error;
      },
      onSuccess: done,
    }),
  };
}

/* ---------- items ---------- */

export const itemsQuery = (restaurantId: string) =>
  queryOptions({
    queryKey: ["items", restaurantId],
    queryFn: async (): Promise<OwnerItem[]> => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("sort_order")
        .order("created_at");
      if (error) throw error;
      const urls = await signPaths(data.map((d) => d.image_url));
      return data.map((d) => ({
        ...d,
        imageSrc: d.image_url ? (urls[d.image_url] ?? null) : null,
      }));
    },
  });

export type ItemInput = Pick<
  ItemRow,
  "name" | "description" | "price" | "is_veg" | "is_available" | "category_id" | "image_url"
>;

export function useItemMutations(restaurantId: string) {
  const qc = useQueryClient();
  const done = () => {
    qc.invalidateQueries({ queryKey: ["items", restaurantId] });
    qc.invalidateQueries({ queryKey: ["public-menu"] });
  };
  return {
    save: useMutation({
      mutationFn: async ({ id, values }: { id?: string | undefined; values: ItemInput }) => {
        const { error } = id
          ? await supabase.from("menu_items").update(values).eq("id", id)
          : await supabase.from("menu_items").insert({ ...values, restaurant_id: restaurantId });
        if (error) throw error;
      },
      onSuccess: done,
    }),
    toggle: useMutation({
      mutationFn: async ({ id, is_available }: { id: string; is_available: boolean }) => {
        const { error } = await supabase.from("menu_items").update({ is_available }).eq("id", id);
        if (error) throw error;
      },
      onSuccess: done,
    }),
    remove: useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase.from("menu_items").delete().eq("id", id);
        if (error) throw error;
      },
      onSuccess: done,
    }),
  };
}

/* ---------- customer menu ---------- */

export type PublicItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string | null;
  image: string | null;
  veg: boolean;
  available: boolean;
  bestseller?: boolean;
  spicy?: boolean;
};

export type PublicMenu = {
  restaurant: {
    id?: string;
    name: string;
    tagline: string;
    address: string | null;
    phone: string | null;
    hours: string | null;
    rating: number | null;
    cover: string | null;
    logo: string | null;
    initials: string;
    isSuspended?: boolean;
  };
  categories: { id: string; name: string }[];
  items: PublicItem[];
};

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("") || "R";

function demoMenu(): PublicMenu {
  const r = demo.restaurant;
  return {
    restaurant: {
      name: r.name,
      tagline: r.tagline,
      address: r.address,
      phone: null,
      hours: r.hours,
      rating: r.rating,
      cover: r.cover,
      logo: null,
      initials: r.initials,
      isSuspended: false,
    },
    categories: demo.categories,
    items: demo.menuItems.map((m) => ({ ...m, categoryId: m.categoryId })),
  };
}

export const publicMenuQuery = (slug: string) =>
  queryOptions({
    queryKey: ["public-menu", slug],
    queryFn: async (): Promise<PublicMenu | null> => {
      const { data: r, error } = await supabase
        .from("restaurants")
        .select("id, name, description, address, phone, logo_url, cover_url")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (!r || (r.description ?? "").includes("[ARCHIVED]"))
        return slug === demo.restaurant.slug ? demoMenu() : null;
      const [{ data: cats, error: e1 }, { data: items, error: e2 }] = await Promise.all([
        supabase
          .from("menu_categories")
          .select("id, name")
          .eq("restaurant_id", r.id)
          .order("sort_order")
          .order("created_at"),
        supabase
          .from("menu_items")
          .select("id, name, description, price, category_id, image_url, is_veg, is_available")
          .eq("restaurant_id", r.id)
          .order("sort_order")
          .order("created_at"),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
      const urls = await signPaths([
        r.logo_url,
        r.cover_url,
        ...(items ?? []).map((i) => i.image_url),
      ]);
      const isSuspended = (r.description ?? "").includes("[SUSPENDED]");
      const cleanTagline = (r.description ?? "").replace("[SUSPENDED]", "").trim();
      return {
        restaurant: {
          id: r.id,
          name: r.name,
          tagline: cleanTagline,
          address: r.address,
          phone: r.phone,
          hours: null,
          rating: null,
          cover: r.cover_url ? (urls[r.cover_url] ?? null) : null,
          logo: r.logo_url ? (urls[r.logo_url] ?? null) : null,
          initials: initialsOf(r.name),
          isSuspended,
        },
        categories: cats ?? [],
        items: (items ?? []).map((i) => ({
          id: i.id,
          name: i.name,
          description: i.description,
          price: Number(i.price),
          categoryId: i.category_id,
          image: i.image_url ? (urls[i.image_url] ?? null) : null,
          veg: i.is_veg,
          available: isSuspended ? false : i.is_available,
        })),
      };
    },
  });

/* ---------- customer ordering ---------- */

export const guestSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(1, "Please enter your name")
    .max(60, "Name must be under 60 characters"),
  table: z
    .number({ message: "Please enter your table number" })
    .int("Enter a whole table number")
    .min(1, "Enter a valid table number")
    .max(999, "Enter a valid table number"),
});

export async function placeOrder(input: {
  slug: string;
  customerName: string;
  table: number;
  notes: string;
  lines: { id: string; qty: number }[];
}) {
  // Check if restaurant is suspended or archived before placing order
  const { data: rCheck } = await supabase
    .from("restaurants")
    .select("description")
    .eq("slug", input.slug)
    .maybeSingle();
  if (rCheck?.description && rCheck.description.includes("[SUSPENDED]")) {
    throw new Error("This restaurant is currently suspended and is not accepting orders.");
  }
  if (rCheck?.description && rCheck.description.includes("[ARCHIVED]")) {
    throw new Error("This restaurant is no longer operating.");
  }

  const { data, error } = await supabase.rpc("place_order", {
    _slug: input.slug,
    _customer_name: input.customerName.trim(),
    _table_number: input.table,
    _items: input.lines,
    _notes: input.notes.trim().slice(0, 300),
  });
  if (error) throw new Error(error.message);
  const d = data as { order_code: string; total: number; created_at: string };
  return { code: d.order_code, total: Number(d.total), createdAt: d.created_at };
}

export function menuUrl(slug: string) {
  return `${typeof window === "undefined" ? "" : window.location.origin}/menu/${slug}`;
}
