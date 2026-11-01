import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/platform/settings")({
  beforeLoad: () => {
    throw redirect({ to: "/super-admin" });
  },
  component: () => null,
});
