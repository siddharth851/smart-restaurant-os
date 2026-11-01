import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/platform/subscriptions")({
  beforeLoad: () => {
    throw redirect({ to: "/super-admin" });
  },
  component: () => null,
});
