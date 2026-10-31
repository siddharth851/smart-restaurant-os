import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PageHeader, Panel } from "@/components/shared/ui-bits";
import { activityLogs } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ShieldAlert, 
  Clock, 
  Filter
} from "lucide-react";

const dotConfig: Record<string, { bg: string; icon: any; border: string; text: string }> = {
  warning: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-600", icon: AlertTriangle },
  info: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-600", icon: Info },
  success: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-600", icon: CheckCircle2 },
  default: { bg: "bg-muted", border: "border-border", text: "text-muted-foreground", icon: Activity },
};

export const Route = createFileRoute("/_authenticated/platform/activity")({
  component: PlatformActivityPage,
});

function PlatformActivityPage() {
  const [filter, setFilter] = useState("all");

  const filteredLogs = useMemo(() => {
    if (filter === "all") return activityLogs;
    return activityLogs.filter((a) => a.type === filter);
  }, [filter]);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="System Audit Trail" 
        description="Immutable real-time event stream of security, configuration, and tenant actions." 
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mr-1">
          <Filter className="h-3.5 w-3.5" /> Filter by:
        </span>
        {[
          { id: "all", label: "All Activity" },
          { id: "success", label: "Success" },
          { id: "info", label: "Info" },
          { id: "warning", label: "Warnings" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "h-8 rounded-lg px-3 text-xs font-semibold transition-all shadow-xs",
              filter === f.id
                ? "bg-forest text-forest-foreground"
                : "border border-border/70 bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Panel title={`Audit Events (${filteredLogs.length})`}>
        <div className="relative pl-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border/60">
          <ol className="space-y-6">
            {filteredLogs.map((a, i) => {
              const cfg = dotConfig[a.type] || dotConfig.default;
              const Icon = cfg.icon;

              return (
                <li key={i} className="relative flex items-start gap-4 group">
                  {/* Timeline icon node */}
                  <div 
                    className={cn(
                      "absolute -left-6 top-0.5 grid h-6 w-6 place-items-center rounded-full border shadow-xs transition-transform group-hover:scale-110",
                      cfg.bg,
                      cfg.border,
                      cfg.text
                    )}
                  >
                    <Icon className="h-3 w-3" />
                  </div>

                  <div className="min-w-0 flex-1 rounded-xl border border-border/60 bg-card p-3.5 shadow-xs transition-all group-hover:border-forest/30">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-bold text-foreground">
                        <span className="text-forest font-semibold">{a.actor}</span>{" "}
                        <span className="font-normal text-muted-foreground">{a.action.toLowerCase()}</span>
                      </p>
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                        <Clock className="h-3 w-3" /> {a.time}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground font-mono bg-muted/30 px-2.5 py-1.5 rounded-lg border border-border/40">
                      {a.target}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </Panel>
    </div>
  );
}
