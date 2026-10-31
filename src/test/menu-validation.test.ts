import { describe, expect, it } from "vitest";
import { itemSchema } from "@/routes/_authenticated/restaurant.menu";
import { categoryName } from "@/routes/_authenticated/restaurant.categories";
import { validateImage } from "@/lib/restaurant-api";

describe("menu validation", () => {
  it("requires a dish name", () => expect(itemSchema.safeParse({ name: " ", description: "", price: 100 }).success).toBe(false));
  it("rejects negative prices", () => expect(itemSchema.safeParse({ name: "Dosa", description: "", price: -1 }).success).toBe(false));
  it("rejects more than 2 decimals", () => expect(itemSchema.safeParse({ name: "Dosa", description: "", price: "10.555" }).success).toBe(false));
  it("accepts a valid dish", () => expect(itemSchema.parse({ name: "Dosa", description: "", price: "180.50" }).price).toBe(180.5));
  it("category name max 60 chars", () => expect(categoryName.safeParse("x".repeat(61)).success).toBe(false));
  it("images over 5 MB are rejected", () => {
    const big = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "a.jpg", { type: "image/jpeg" });
    expect(validateImage(big)).not.toBeNull();
    expect(validateImage(new File(["x"], "a.gif", { type: "image/gif" }))).not.toBeNull();
  });
});
