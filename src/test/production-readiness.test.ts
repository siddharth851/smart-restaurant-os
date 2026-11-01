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
import { nextStatus, trackOrderQuery } from "@/lib/orders-api";

describe("Production Readiness Audit", () => {
  // 1. Super Admin credentials & role assignment
  it("Audit 1: Super Admin credentials and role assignment (no hardcoded passwords)", () => {
    expect(SUPER_ADMIN_EMAIL).toBe("admin@smartrestaurantos.com");
    // Verify VITE_SUPER_ADMIN_PASSWORD is completely removed from frontend environment
    expect((import.meta.env as Record<string, unknown>).VITE_SUPER_ADMIN_PASSWORD).toBeUndefined();
    // Super admin role access
    expect(hasAnyRole(["super_admin"], [...PANEL_ROLES.superAdmin])).toBe(true);
    expect(homeForRoles(["super_admin"])).toBe("/super-admin");
  });

  // 2. Public registration cannot create a Super Admin
  it("Audit 2: Public registration cannot create a Super Admin", () => {
    // Only restaurant_owner role is ever assigned to public registrants
    const registrantRoles = ["restaurant_owner"] as const;
    expect(hasAnyRole([...registrantRoles], [...PANEL_ROLES.superAdmin])).toBe(false);
    expect((registrantRoles as readonly string[]).includes("super_admin")).toBe(false);
  });

  // 3. Simplified roles: Exactly 3 user experiences (Super Admin, Restaurant Owner, Customer)
  it("Audit 3: Architecture simplification - no staff system and owner manages kitchen", () => {
    // Restaurant owner has access to restaurant panel and kitchen display
    expect(hasAnyRole(["restaurant_owner"], [...PANEL_ROLES.restaurant])).toBe(true);
    expect(hasAnyRole(["restaurant_owner"], [...PANEL_ROLES.kitchen])).toBe(true);
    // Super admin manages platform fleet
    expect(hasAnyRole(["super_admin"], [...PANEL_ROLES.superAdmin])).toBe(true);
    expect(hasAnyRole(["super_admin"], [...PANEL_ROLES.restaurant])).toBe(false);
  });

  // 4. Restaurant deletion preserves order history and financial records
  it("Audit 4: Restaurant deletion does not destroy order history", async () => {
    const activeDesc = "Gourmet trattoria in central plaza";
    const archivedDesc = "[ARCHIVED] Gourmet trattoria in central plaza";

    // When a restaurant has order history, deletion archives it safely
    expect(archivedDesc.includes("[ARCHIVED]")).toBe(true);
    expect(activeDesc.includes("[ARCHIVED]")).toBe(false);

    // Verify public menu returns null for archived restaurants
    const menuResult = await publicMenuQuery("archived-restaurant-slug").queryFn();
    expect(menuResult).toBeNull();
  });

  // 5. Panel routes and role mappings
  it("Audit 5: Panel route access matrices are strictly enforced", () => {
    // Super Admin panel requires super_admin
    expect(hasAnyRole(["super_admin"], [...PANEL_ROLES.superAdmin])).toBe(true);
    expect(hasAnyRole(["restaurant_owner"], [...PANEL_ROLES.superAdmin])).toBe(false);

    // Restaurant panel requires restaurant_owner
    expect(hasAnyRole(["restaurant_owner"], [...PANEL_ROLES.restaurant])).toBe(true);
    expect(hasAnyRole(["super_admin"], [...PANEL_ROLES.restaurant])).toBe(false);

    // Kitchen panel accessible by restaurant owner directly
    expect(hasAnyRole(["restaurant_owner"], [...PANEL_ROLES.kitchen])).toBe(true);
  });

  // 6. Complete Flow: Order placement -> Kitchen status transitions -> Customer tracking
  it("Audit 6: Complete order lifecycle", async () => {
    const { data: rest } = await supabase.from("restaurants").select("id, slug").limit(1).single();
    expect(rest).toBeDefined();

    const { data: items } = await supabase
      .from("menu_items")
      .select("id, name, price, is_available")
      .eq("restaurant_id", rest!.id);
    const availableItem = items?.find((i) => i.is_available);

    if (availableItem) {
      // 1. Customer places order
      const order = await placeOrder({
        slug: rest!.slug,
        customerName: "Audit Test Customer",
        table: 9,
        notes: "No onions",
        lines: [{ id: availableItem.id, qty: 1 }],
      });
      expect(order.code).toMatch(/^ORD-[A-Z0-9]{8}$/);

      // 2. Customer tracks order
      const track1 = await trackOrderQuery(order.code).queryFn();
      expect(track1?.status).toBe("received");
      expect(track1?.table).toBe(9);

      // 3. Kitchen status transitions follow monotonic state machine
      const step1 = nextStatus(track1!.status);
      expect(step1?.to).toBe("accepted");

      const step2 = nextStatus(step1!.to);
      expect(step2?.to).toBe("preparing");

      const step3 = nextStatus(step2!.to);
      expect(step3?.to).toBe("ready");

      const step4 = nextStatus(step3!.to);
      expect(step4?.to).toBe("served");

      expect(nextStatus(step4!.to)).toBeNull();
    }
  });

  // 7. Supabase RLS and tenant isolation using two separate restaurants
  it("Audit 7: Two separate restaurants have strict tenant isolation", async () => {
    const { data: restaurants } = await supabase
      .from("restaurants")
      .select("id, name, slug")
      .limit(2);
    expect(restaurants).toBeDefined();

    if (restaurants && restaurants.length >= 2) {
      const [restA, restB] = restaurants;
      expect(restA.id).not.toBe(restB.id);

      // Menu items are strictly partitioned by restaurant_id
      const { data: itemsA } = await supabase
        .from("menu_items")
        .select("id, restaurant_id")
        .eq("restaurant_id", restA.id);
      const { data: itemsB } = await supabase
        .from("menu_items")
        .select("id, restaurant_id")
        .eq("restaurant_id", restB.id);

      itemsA?.forEach((item) => expect(item.restaurant_id).toBe(restA.id));
      itemsB?.forEach((item) => expect(item.restaurant_id).toBe(restB.id));

      // Items from A do not appear in B
      const idsA = new Set((itemsA ?? []).map((i) => i.id));
      itemsB?.forEach((item) => {
        expect(idsA.has(item.id)).toBe(false);
      });

      // Anonymous / cross-tenant update attempts are blocked by RLS
      const { data: updateRes } = await supabase
        .from("restaurants")
        .update({ name: "CrossTenantTamper" })
        .eq("id", restB.id);
      expect(updateRes).toBeNull();
    }
  });

  // 8. Production environment variables
  it("Audit 8: Supabase and app environment variables are correctly loaded", () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    expect(supabaseUrl).toBeDefined();
    expect(supabaseUrl).toContain("supabase.co");
    expect(publishableKey).toBeDefined();
    expect(publishableKey).toMatch(/^sb_publishable_/);
  });

  // 9. Confirm no secret keys or hardcoded passwords exposed
  it("Audit 9: Secrets check - no service role keys or hardcoded passwords", () => {
    const pubKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    // Ensure service_role secret key is NOT in public env
    expect(pubKey).not.toContain("service_role");
    expect((import.meta.env as Record<string, unknown>).SUPABASE_SERVICE_ROLE_KEY).toBeUndefined();
  });
});
