import { supabase } from "@/integrations/supabase/client";
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  adminEditRestaurantServer, 
  adminToggleSuspensionServer, 
  adminDeleteRestaurantServer 
} from "./platform.server";

export type PlatformRestaurant = {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  description: string;
  createdAt: string;
  isSuspended: boolean;
  itemCount: number;
  categoryCount: number;
  orderCount: number;
  revenue: number;
};

export const platformRestaurantsQuery = queryOptions({
  queryKey: ["platform-restaurants"],
  queryFn: async (): Promise<PlatformRestaurant[]> => {
    // 1. Fetch real restaurants from Supabase
    const { data: restaurants, error } = await supabase
      .from("restaurants")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!restaurants || restaurants.length === 0) return [];

    // 2. Fetch related items and categories for accurate counts
    const [{ data: items }, { data: cats }, { data: orders }] = await Promise.all([
      supabase.from("menu_items").select("restaurant_id"),
      supabase.from("menu_categories").select("restaurant_id"),
      supabase.from("orders").select("restaurant_id, total"),
    ]);

    const itemCounts = (items ?? []).reduce((acc: Record<string, number>, i) => {
      acc[i.restaurant_id] = (acc[i.restaurant_id] ?? 0) + 1;
      return acc;
    }, {});

    const catCounts = (cats ?? []).reduce((acc: Record<string, number>, c) => {
      acc[c.restaurant_id] = (acc[c.restaurant_id] ?? 0) + 1;
      return acc;
    }, {});

    const orderStats = (orders ?? []).reduce(
      (acc: Record<string, { count: number; revenue: number }>, o) => {
        if (!acc[o.restaurant_id]) acc[o.restaurant_id] = { count: 0, revenue: 0 };
        acc[o.restaurant_id].count += 1;
        acc[o.restaurant_id].revenue += Number(o.total || 0);
        return acc;
      },
      {}
    );

    const activeRestaurants = (restaurants ?? []).filter((r) => !(r.description ?? "").includes("[ARCHIVED]"));

    return activeRestaurants.map((r) => {
      const isSuspended = (r.description ?? "").includes("[SUSPENDED]");
      const cleanDesc = (r.description ?? "").replace(/\[(SUSPENDED|ARCHIVED)\]/g, "").trim();
      const stats = orderStats[r.id] ?? { count: 0, revenue: 0 };

      return {
        id: r.id,
        name: r.name,
        slug: r.slug,
        ownerName: r.name ? `${r.name} Partner` : "Owner",
        phone: r.phone ?? "N/A",
        email: r.email ?? "N/A",
        address: r.address ?? "Standard Outlet",
        description: cleanDesc,
        createdAt: r.created_at,
        isSuspended,
        itemCount: itemCounts[r.id] ?? 0,
        categoryCount: catCounts[r.id] ?? 0,
        orderCount: stats.count,
        revenue: stats.revenue,
      };
    });
  },
});

export function usePlatformRestaurantMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["platform-restaurants"] });
    qc.invalidateQueries({ queryKey: ["platform-analytics"] });
    qc.invalidateQueries({ queryKey: ["public-menu"] });
  };

  return {
    add: useMutation({
      mutationFn: async (input: { name: string; slug?: string; phone?: string; email?: string; address?: string; description?: string }) => {
        const id = crypto.randomUUID();
        const baseSlug = input.slug?.trim() || input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "restaurant";
        const slug = `${baseSlug}-${id.replace(/-/g, "").slice(0, 6)}`;

        const { error } = await supabase.from("restaurants").insert({
          id,
          owner_id: crypto.randomUUID(),
          name: input.name.trim(),
          slug,
          phone: input.phone?.trim() || null,
          email: input.email?.trim() || null,
          address: input.address?.trim() || null,
          description: input.description?.trim() || null,
        });
        if (error) {
          if (error.code === "42501") {
            throw new Error("Restaurants must be registered via the Owner Registration flow (/register) to establish authentic owner credentials.");
          }
          throw error;
        }
      },
      onSuccess: invalidate,
    }),

    edit: useMutation({
      mutationFn: async (input: { id: string; name: string; phone?: string; email?: string; address?: string; description?: string }) => {
        await adminEditRestaurantServer({ data: input });
      },
      onSuccess: invalidate,
    }),

    toggleSuspension: useMutation({
      mutationFn: async ({ id, suspend }: { id: string; suspend: boolean }) => {
        await adminToggleSuspensionServer({ data: { id, suspend } });
      },
      onSuccess: invalidate,
    }),

    deleteRestaurant: useMutation({
      mutationFn: async (id: string) => {
        await adminDeleteRestaurantServer({ data: { id } });
      },
      onSuccess: invalidate,
    }),
  };
}
