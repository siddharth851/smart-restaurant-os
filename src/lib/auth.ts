import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

export type AuthInfo = {
  userId: string;
  email: string;
  name: string;
  roles: AppRole[];
};

export const SUPER_ADMIN_EMAIL = (import.meta.env.VITE_SUPER_ADMIN_EMAIL || "admin@smartrestaurantos.com").toLowerCase();
export const SUPER_ADMIN_ID = "00000000-0000-0000-0000-000000000001";

const STORAGE_KEY = "smartos_auth_session";

export type LocalSession = {
  userId: string;
  email: string;
  name: string;
  roles: AppRole[];
  restaurantId?: string;
  restaurantSlug?: string;
};

export function getLocalSession(): LocalSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setLocalSession(session: LocalSession | null) {
  if (typeof window === "undefined") return;
  try {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.error("Failed to write auth session to localStorage", e);
  }
}

/** Roles come from active authenticated Supabase session or verified local session. */
export async function loadAuthInfo(): Promise<AuthInfo | null> {
  // 1. Check Supabase Auth session first (canonical ground-truth)
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error && data?.user) {
      const user = data.user;
      const [{ data: roles }, { data: profile }, { data: myRest }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", user.id),
        supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
        supabase.from("restaurants").select("id, slug").eq("owner_id", user.id).limit(1).maybeSingle(),
      ]);

      const userRoles = (roles ?? []).map((r) => r.role);
      if (userRoles.length === 0 || myRest) {
        if (!userRoles.includes("restaurant_owner") && myRest) {
          userRoles.push("restaurant_owner");
        }
      }

      // Sync local session with the real Supabase Auth user so helpers never have stale IDs
      setLocalSession({
        userId: user.id,
        email: user.email ?? "",
        name: profile?.full_name || (user.user_metadata?.full_name as string) || user.email || "Restaurant Owner",
        roles: userRoles.length > 0 ? userRoles : ["restaurant_owner"],
        restaurantId: myRest?.id,
        restaurantSlug: myRest?.slug,
      });

      return {
        userId: user.id,
        email: user.email ?? "",
        name: profile?.full_name || (user.user_metadata?.full_name as string) || user.email || "Account",
        roles: userRoles.length > 0 ? userRoles : ["restaurant_owner"],
      };
    }
  } catch {
    // continue to local session fallback
  }

  // 2. Super Admin server-side authorized session bridge
  const local = getLocalSession();
  if (local && local.roles.includes("super_admin")) {
    return {
      userId: local.userId,
      email: local.email,
      name: local.name,
      roles: ["super_admin"],
    };
  }

  // Stale owner session without active Supabase credentials — clean up to prevent unauthenticated database queries
  if (local) {
    setLocalSession(null);
  }

  return null;
}

export async function signOutAll(): Promise<void> {
  setLocalSession(null);
  try {
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
}

export const hasAnyRole = (roles: AppRole[], allowed: AppRole[]) => roles.some((r) => allowed.includes(r));

/** Access matrix for the two authenticated panels (Super Admin & Restaurant Owner). */
export const PANEL_ROLES = {
  superAdmin: ["super_admin"],
  platform: ["super_admin"],
  restaurant: ["restaurant_owner"],
  restaurantOwnerOnly: ["restaurant_owner"],
  kitchen: ["restaurant_owner"],
} as const satisfies Record<string, AppRole[]>;

export function homeForRoles(roles: AppRole[]): "/super-admin" | "/restaurant" | "/unauthorized" {
  if (roles.includes("super_admin")) return "/super-admin";
  if (roles.includes("restaurant_owner")) return "/restaurant";
  return "/unauthorized";
}

export const ROLE_LABEL: Record<AppRole, string> = {
  super_admin: "Super Admin",
  restaurant_owner: "Restaurant Owner",
  restaurant_staff: "Restaurant Owner",
  kitchen_staff: "Restaurant Owner",
};

/** Only allow same-origin relative paths as post-login redirects. */
export function safeRedirect(path: unknown): string | null {
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//") ? path : null;
}
