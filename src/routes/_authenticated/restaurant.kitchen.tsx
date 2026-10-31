import { createFileRoute, Link } from "@tanstack/react-router";
import { Maximize2 } from "lucide-react";
import { PageHeader } from "@/components/shared/ui-bits";
import { KdsBoard } from "@/components/shared/kds-board";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/restaurant/kitchen")({
  component: () => (
    <>
      <PageHeader
        title="Kitchen Display"
        description="Move tickets through the line as dishes are cooked."
        actions={<Button asChild variant="outline"><Link to="/kitchen"><Maximize2 /> Full screen</Link></Button>}
      />
      <KdsBoard />
    </>
  ),
});
