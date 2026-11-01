import { describe, expect, it } from "vitest";
import { hasAnyRole, homeForRoles, PANEL_ROLES, safeRedirect } from "@/lib/auth";

describe("role-based access", () => {
  it("super admin lands on the super-admin console", () =>
    expect(homeForRoles(["super_admin"])).toBe("/super-admin"));
  it("owner lands on the restaurant admin", () =>
    expect(homeForRoles(["restaurant_owner"])).toBe("/restaurant"));
  it("account without a role is unauthorized", () =>
    expect(homeForRoles([])).toBe("/unauthorized"));
  it("only super admin may open the super-admin console", () => {
    expect(hasAnyRole(["restaurant_owner"], [...PANEL_ROLES.superAdmin])).toBe(false);
    expect(hasAnyRole(["super_admin"], [...PANEL_ROLES.superAdmin])).toBe(true);
  });
  it("owner has access to restaurant panel and kitchen", () => {
    expect(hasAnyRole(["restaurant_owner"], [...PANEL_ROLES.restaurant])).toBe(true);
    expect(hasAnyRole(["restaurant_owner"], [...PANEL_ROLES.kitchen])).toBe(true);
  });
  it("super admin without restaurant_owner role does not have direct restaurant access", () => {
    expect(hasAnyRole(["super_admin"], [...PANEL_ROLES.restaurant])).toBe(false);
  });
  it("rejects off-site redirects", () => {
    expect(safeRedirect("//evil.com")).toBeNull();
    expect(safeRedirect("https://evil.com")).toBeNull();
    expect(safeRedirect("/restaurant/orders")).toBe("/restaurant/orders");
  });
});
