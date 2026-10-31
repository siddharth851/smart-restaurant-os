import { describe, expect, it } from "vitest";
import { nextStatus } from "@/lib/orders-api";

describe("kitchen status flow", () => {
  it("goes Accept → Preparing → Ready → Served", () => {
    expect(nextStatus("received")?.to).toBe("accepted");
    expect(nextStatus("accepted")?.to).toBe("preparing");
    expect(nextStatus("preparing")?.to).toBe("ready");
    expect(nextStatus("ready")?.to).toBe("served");
    expect(nextStatus("served")).toBeNull();
  });
});
