import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SUPER_ADMIN_EMAIL, SUPER_ADMIN_ID } from "./auth";

const adminAuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

/**
 * Server-side trusted administrative authentication core logic.
 * Executes EXCLUSIVELY on the server.
 */
export async function verifySuperAdminCredentials(input: { email: string; password: string }) {
  const { email, password } = input;
  const cleanEmail = email.trim().toLowerCase();

  // 1. Verify that email is the designated Super Admin
  if (cleanEmail !== SUPER_ADMIN_EMAIL.toLowerCase()) {
    return { ok: false, error: "Unauthorized access: Not a platform administrator." };
  }

  // 2. Authenticate through Supabase Auth
  try {
    const { data: suData, error: suError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (!suError && suData.user) {
      return {
        ok: true,
        user: {
          id: suData.user.id,
          email: cleanEmail,
          name: "Platform Administrator",
          roles: ["super_admin"] as const,
        },
        session: suData.session,
      };
    }

    // If Supabase returned invalid credentials, reject immediately
    if (suError && !suError.message.toLowerCase().includes("email not confirmed")) {
      return { ok: false, error: "Invalid administrator credentials." };
    }
  } catch (err) {
    console.error("Supabase auth error during admin verification:", err);
  }

  // 3. Fallback to server-side administrative verification
  // Checks secure server-only environment variable (never exposed with VITE_ prefix)
  const serverAdminSecret = process.env.SUPER_ADMIN_SERVER_SECRET || process.env.LOVABLE_ADMIN_KEY;
  if (serverAdminSecret && password === serverAdminSecret) {
    return {
      ok: true,
      user: {
        id: SUPER_ADMIN_ID,
        email: cleanEmail,
        name: "Platform Administrator",
        roles: ["super_admin"] as const,
      },
    };
  }

  return { ok: false, error: "Invalid administrator credentials." };
}

/**
 * Server-side trusted administrative authentication.
 * Executes EXCLUSIVELY on the server (Node.js/Nitro runtime).
 * Never bundled into or executed on the client browser.
 */
export const authenticateSuperAdminServer = createServerFn({ method: "POST" })
  .validator((data: unknown) => adminAuthSchema.parse(data))
  .handler(async ({ data }) => {
    return await verifySuperAdminCredentials(data);
  });
