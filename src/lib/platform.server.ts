import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const editSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

const suspendSchema = z.object({
  id: z.string().uuid(),
  suspend: z.boolean(),
});

const deleteSchema = z.object({
  id: z.string().uuid(),
});

export const adminEditRestaurantServer = createServerFn({ method: "POST" })
  .validator((data: unknown) => editSchema.parse(data))
  .handler(async ({ data: input }) => {
    // Read current description to maintain suspension state if any
    const { data: current } = await supabaseAdmin
      .from("restaurants")
      .select("description")
      .eq("id", input.id)
      .single();

    const wasSuspended = (current?.description ?? "").includes("[SUSPENDED]");
    const newDesc = wasSuspended
      ? `[SUSPENDED] ${input.description ?? ""}`.trim()
      : input.description?.trim() || null;

    const { error } = await supabaseAdmin
      .from("restaurants")
      .update({
        name: input.name.trim(),
        phone: input.phone?.trim() || null,
        email: input.email?.trim() || null,
        address: input.address?.trim() || null,
        description: newDesc,
      })
      .eq("id", input.id);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminToggleSuspensionServer = createServerFn({ method: "POST" })
  .validator((data: unknown) => suspendSchema.parse(data))
  .handler(async ({ data: { id, suspend } }) => {
    const { data: current, error: getErr } = await supabaseAdmin
      .from("restaurants")
      .select("description")
      .eq("id", id)
      .single();

    if (getErr) throw new Error(getErr.message);

    let desc = (current?.description ?? "").replace("[SUSPENDED]", "").trim();
    if (suspend) {
      desc = `[SUSPENDED] ${desc}`.trim();
    }

    const { error } = await supabaseAdmin
      .from("restaurants")
      .update({ description: desc })
      .eq("id", id);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteRestaurantServer = createServerFn({ method: "POST" })
  .validator((data: unknown) => deleteSchema.parse(data))
  .handler(async ({ data: { id } }) => {
    // Check if restaurant has order history
    const { data: existingOrders } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("restaurant_id", id)
      .limit(1);

    if (existingOrders && existingOrders.length > 0) {
      // Soft-delete / Archive restaurant so historic orders and financial analytics remain intact
      const { data: current } = await supabaseAdmin
        .from("restaurants")
        .select("description")
        .eq("id", id)
        .single();

      const cleanDesc = (current?.description ?? "").replace(/\[(SUSPENDED|ARCHIVED|DELETED)\]/g, "").trim();
      const { error } = await supabaseAdmin
        .from("restaurants")
        .update({ description: `[ARCHIVED] ${cleanDesc}`.trim() })
        .eq("id", id);

      if (error) throw new Error(error.message);
    } else {
      // If no order history exists, safe to delete from table
      const { error } = await supabaseAdmin.from("restaurants").delete().eq("id", id);
      if (error) {
        // Fallback to archive if FK exists
        const { data: current } = await supabaseAdmin
          .from("restaurants")
          .select("description")
          .eq("id", id)
          .single();

        const cleanDesc = (current?.description ?? "").replace(/\[(SUSPENDED|ARCHIVED|DELETED)\]/g, "").trim();
        await supabaseAdmin
          .from("restaurants")
          .update({ description: `[ARCHIVED] ${cleanDesc}`.trim() })
          .eq("id", id);
      }
    }
    return { ok: true };
  });
