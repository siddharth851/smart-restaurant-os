import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/platform/activity")({
  beforeLoad: () => {
    throw redirect({ to: "/super-admin" });
  },
  component: () => null,
});
