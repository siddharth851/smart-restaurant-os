import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/login")({
  beforeLoad: () => {
    throw redirect({ to: "/super-admin/login" });
  },
  component: () => null,
});
