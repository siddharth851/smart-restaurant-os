import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const confirmSchema = z.object({
  email: z.string().trim().email(),
});

/**
 * Server-side trusted handler to safely confirm unconfirmed Supabase Auth accounts.
 * Runs strictly on the server runtime (Nitro / Node.js).
 * Never exposes the Supabase service role key to frontend code or client bundles.
 */
export async function confirmUnconfirmedAccount(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return {
      ok: false,
      error: "SUPABASE_SERVICE_ROLE_KEY is not configured in the server environment.",
    };
  }

  try {
    const adminClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 1. List users to find the unconfirmed account
    const { data: usersData, error: listError } = await adminClient.auth.admin.listUsers({
      perPage: 1000,
    });

    if (listError) {
      console.error("[Auth Server] Admin listUsers error:", listError);
      return { ok: false, error: listError.message };
    }

    const targetUser = usersData.users.find(
      (u) => u.email?.toLowerCase() === cleanEmail
    );

    if (!targetUser) {
      return { ok: false, error: "No Supabase user found with this email." };
    }

    // 2. If already confirmed, return success
    if (targetUser.email_confirmed_at) {
      return { ok: true, alreadyConfirmed: true, userId: targetUser.id };
    }

    // 3. Confirm the user safely via Admin API
    const { data: updated, error: updateError } = await adminClient.auth.admin.updateUserById(
      targetUser.id,
      { email_confirm: true }
    );

    if (updateError) {
      console.error("[Auth Server] Admin updateUserById error:", updateError);
      return { ok: false, error: updateError.message };
    }

    return {
      ok: true,
      confirmed: true,
      userId: updated.user.id,
    };
  } catch (err) {
    console.error("[Auth Server] Unexpected error confirming user:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Server error during account confirmation.",
    };
  }
}

/**
 * Server function callable from registration or login flows.
 * Handles existing unconfirmed accounts without requiring OTP or email confirmation clicks.
 */
export const confirmUserServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => confirmSchema.parse(data))
  .handler(async ({ data }) => {
    return await confirmUnconfirmedAccount(data.email);
  });
