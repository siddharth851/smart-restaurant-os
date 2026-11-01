import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/restaurant/staff")({
  beforeLoad: () => {
    throw redirect({ to: "/restaurant" });
  },
  component: () => null,
});
