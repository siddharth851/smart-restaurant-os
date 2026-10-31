import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, SimpleTable, StatusBadge } from "@/components/shared/ui-bits";
import { plans, platformRestaurants } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/platform/subscriptions")({
  component: () => (
    <>
      <PageHeader
        title="Fleet Subscription Management"
        description="Internal account tiers, table allocation limits, and active franchise distribution."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {plans.map((p) => (
          <div
            key={p.name}
            className="rounded-3xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-xs hover:border-stone-300 transition-all"
          >
            <p className="font-display text-base font-bold text-stone-900">{p.name}</p>
            <p className="text-xs text-stone-500 mt-0.5">{p.tables}</p>
            <p className="mt-4 font-display text-3xl font-extrabold text-stone-900">{p.restaurants}</p>
            <p className="text-xs text-stone-400">active outlets</p>
          </div>
        ))}
      </div>

      <Panel title="Allotted Restaurant Tiers" className="mt-8">
        <SimpleTable
          head={["Restaurant Outlet", "Account Tier", "Tables Allocated", "Fleet Status"]}
          rows={platformRestaurants.map((r) => [
            <span className="font-bold text-stone-900">{r.name}</span>,
            <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 text-xs">
              {r.plan}
            </span>,
            <span className="font-mono text-xs text-stone-600">{r.tables} tables</span>,
            <StatusBadge status={r.status} />,
          ])}
        />
      </Panel>
    </>
  ),
});
