import { describe, expect, it } from "vitest";
import { guestSchema } from "@/lib/restaurant-api";

describe("guest details before ordering", () => {
  it("requires a customer name", () => {
    expect(guestSchema.safeParse({ customerName: "  ", table: 4 }).success).toBe(false);
  });
  it("requires a table number", () => {
    expect(guestSchema.safeParse({ customerName: "Priya", table: undefined }).success).toBe(false);
    expect(guestSchema.safeParse({ customerName: "Priya", table: 0 }).success).toBe(false);
  });
  it("accepts a name and table", () => {
    expect(guestSchema.safeParse({ customerName: "Priya", table: 4 }).success).toBe(true);
  });
});
