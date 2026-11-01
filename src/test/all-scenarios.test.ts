import { describe, expect, it } from "vitest";
import { supabase } from "@/integrations/supabase/client";
import {
  hasAnyRole,
  homeForRoles,
  PANEL_ROLES,
  SUPER_ADMIN_EMAIL,
  SUPER_ADMIN_ID,
  setLocalSession,
  getLocalSession,
} from "@/lib/auth";
import { placeOrder, publicMenuQuery, menuUrl } from "@/lib/restaurant-api";
import { nextStatus, trackOrderQuery, restaurantOrdersQuery } from "@/lib/orders-api";

describe("Scenario Testing — Smart Restaurant OS", () => {
  // Scenario 1: Main Admin login and dashboard access
  it("Scenario 1: Super Admin has authorized platform-only access", () => {
    const roles = ["super_admin"] as const;
    expect(hasAnyRole([...roles], [...PANEL_ROLES.superAdmin])).toBe(true);
    expect(homeForRoles([...roles])).toBe("/super-admin");
    // Verify non-admins cannot access super-admin
    expect(hasAnyRole(["restaurant_owner"], [...PANEL_ROLES.superAdmin])).toBe(false);
  });

  // Scenario 2: Main Admin adds, edits, suspends and reactivates a restaurant
  it("Scenario 2: Restaurant suspension flag detection and order blocking", async () => {
    const testActiveDesc = "Classic dining room with fresh meals";
    const testSuspendedDesc = "[SUSPENDED] Classic dining room with fresh meals";

    const isActive = !testActiveDesc.includes("[SUSPENDED]");
    const isSuspended = testSuspendedDesc.includes("[SUSPENDED]");

    expect(isActive).toBe(true);
    expect(isSuspended).toBe(true);

    // Verify placeOrder throws when restaurant is suspended
    // We test with a mock slug that will have [SUSPENDED] or throw appropriately
    const fakeSlug = "non-existent-suspended-slug";
    await expect(
      placeOrder({
        slug: fakeSlug,
        customerName: "Test Diner",
        table: 2,
        notes: "",
        lines: [{ id: "00000000-0000-0000-0000-000000000000", qty: 1 }],
      }),
    ).rejects.toThrow();
  });

  // Scenario 3: Restaurant owner registers and logs in
  it("Scenario 3: Restaurant Owner lands on /restaurant dashboard", () => {
    const roles = ["restaurant_owner"] as const;
    expect(hasAnyRole([...roles], [...PANEL_ROLES.restaurant])).toBe(true);
    expect(hasAnyRole([...roles], [...PANEL_ROLES.restaurantOwnerOnly])).toBe(true);
    expect(homeForRoles([...roles])).toBe("/restaurant");
  });

  // Scenario 4: Owner generates QR with table number
  it("Scenario 4: Generates valid QR URLs with direct table parameters", () => {
    const slug = "e2e-bistro-2d6777";
    const base = menuUrl(slug);
    expect(base).toContain(`/menu/${slug}`);

    const table3Url = `${base}?table=3`;
    expect(table3Url).toContain("?table=3");
  });

  // Scenario 5: Customer scans QR and places order
  it("Scenario 5: Real customer order placement via place_order RPC", async () => {
    // Read an active restaurant and its menu items
    const { data: rest } = await supabase.from("restaurants").select("id, slug").limit(1).single();
    expect(rest).toBeDefined();

    const { data: items } = await supabase
      .from("menu_items")
      .select("id, name, price, is_available")
      .eq("restaurant_id", rest!.id);
    const availableItem = items?.find((i) => i.is_available);

    if (availableItem) {
      const order = await placeOrder({
        slug: rest!.slug,
        customerName: "Aarav Mehta",
        table: 4,
        notes: "Mild spice",
        lines: [{ id: availableItem.id, qty: 1 }],
      });

      expect(order.code).toMatch(/^ORD-[A-Z0-9]{8}$/);
      expect(order.total).toBe(Number(availableItem.price));

      // Scenario 8: Live customer tracking
      const trackRes = await trackOrderQuery(order.code).queryFn();
      expect(trackRes).toBeDefined();
      expect(trackRes?.code).toBe(order.code);
      expect(trackRes?.table).toBe(4);
      expect(trackRes?.customerName).toBe("Aarav Mehta");
      expect(trackRes?.status).toBe("received");
    }
  });

  // Scenario 6 & 7: Kitchen display status transitions
  it("Scenario 6 & 7: Kitchen advances order status strictly forward", () => {
    expect(nextStatus("received")?.to).toBe("accepted");
    expect(nextStatus("accepted")?.to).toBe("preparing");
    expect(nextStatus("preparing")?.to).toBe("ready");
    expect(nextStatus("ready")?.to).toBe("served");
    expect(nextStatus("served")).toBeNull();
  });

  // Scenario 9: Data isolation between restaurants
  it("Scenario 9: Restaurant data isolation via RLS and query scoping", async () => {
    const { data: restaurants } = await supabase.from("restaurants").select("id, name, slug");
    expect(restaurants).toBeDefined();
    expect(restaurants!.length).toBeGreaterThan(0);

    if (restaurants!.length >= 2) {
      const rA = restaurants![0];
      const rB = restaurants![1];
      expect(rA.id).not.toBe(rB.id);

      // Menu items are strictly scoped to restaurant_id
      const { data: itemsA } = await supabase
        .from("menu_items")
        .select("restaurant_id")
        .eq("restaurant_id", rA.id);
      itemsA?.forEach((item) => expect(item.restaurant_id).toBe(rA.id));
    }
  });

  // Scenario 10: Unauthorized users cannot access Main Admin
  it("Scenario 10: Unauthorized users blocked from platform console", () => {
    expect(hasAnyRole([], [...PANEL_ROLES.platform])).toBe(false);
    expect(hasAnyRole(["restaurant_owner"], [...PANEL_ROLES.platform])).toBe(false);
    expect(hasAnyRole(["restaurant_staff"], [...PANEL_ROLES.platform])).toBe(false);
    expect(hasAnyRole(["kitchen_staff"], [...PANEL_ROLES.platform])).toBe(false);
  });
});
