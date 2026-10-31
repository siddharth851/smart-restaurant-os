import { createFileRoute } from "@tanstack/react-router";
import { KdsBoard } from "@/components/shared/kds-board";

export const Route = createFileRoute("/_authenticated/kitchen/")({ component: () => <KdsBoard dark /> });
