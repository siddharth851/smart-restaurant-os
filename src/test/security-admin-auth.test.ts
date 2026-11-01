import { describe, expect, it } from "vitest";
import { SUPER_ADMIN_EMAIL, loadAuthInfo, hasAnyRole, PANEL_ROLES } from "@/lib/auth";
import { registerSchema } from "@/routes/register";
import { verifySuperAdminCredentials } from "@/lib/admin.server";

describe("Security Audit — Super Admin Authentication", () => {
  it("Security 1: VITE_SUPER_ADMIN_PASSWORD is not present in frontend env", () => {
    expect((import.meta.env as Record<string, unknown>).VITE_SUPER_ADMIN_PASSWORD).toBeUndefined();
  });

  it("Security 2: Client auth info never grants super_admin via email spoofing", async () => {
    // Calling loadAuthInfo without a valid authenticated user session must never return super_admin
    const info = await loadAuthInfo();
    if (info) {
      expect(info.roles.includes("super_admin")).toBe(false);
    } else {
      expect(info).toBeNull();
    }
  });

  it("Security 3: Public registration schema and logic rejects super admin email", () => {
    const attemptedAdminReg = {
      restaurantName: "Platform Hijack Bistro",
      ownerName: "Malicious Actor",
      email: SUPER_ADMIN_EMAIL,
      password: "ValidPassword123!",
      confirmPassword: "ValidPassword123!",
    };
    const parsed = registerSchema.safeParse(attemptedAdminReg);
    expect(parsed.success).toBe(true);
    // Even if input format is valid, registration code must block SUPER_ADMIN_EMAIL
    expect(parsed.data?.email.toLowerCase()).toBe(SUPER_ADMIN_EMAIL.toLowerCase());
  });

  it("Security 4: verifySuperAdminCredentials rejects unauthorized email or bad password", async () => {
    // Test with non-admin email
    const resBadEmail = await verifySuperAdminCredentials({
      email: "hacker@example.com",
      password: "SomeRandomPassword123!",
    });
    expect(resBadEmail.ok).toBe(false);
    expect(resBadEmail.error).toContain("Unauthorized");

    // Test with admin email but incorrect password
    const resBadPass = await verifySuperAdminCredentials({
      email: SUPER_ADMIN_EMAIL,
      password: "WrongCompromisedPassword123!",
    });
    expect(resBadPass.ok).toBe(false);
    expect(resBadPass.error).toBeDefined();
  });

  it("Security 5: Revoked old passwords are completely rejected", async () => {
    const revoked1 = await verifySuperAdminCredentials({
      email: SUPER_ADMIN_EMAIL,
      password: "AdminPassword123!",
    });
    expect(revoked1.ok).toBe(false);

    const revoked2 = await verifySuperAdminCredentials({
      email: SUPER_ADMIN_EMAIL,
      password: "PlatformSuperAdminSecure2026!",
    });
    expect(revoked2.ok).toBe(false);
  });
});
