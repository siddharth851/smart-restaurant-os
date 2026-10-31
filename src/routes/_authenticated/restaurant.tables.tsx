import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Plus, QrCode, Users, Sparkles, Copy, Check, ExternalLink } from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/shared/ui-bits";
import { RestaurantQrCard } from "@/components/admin/restaurant-qr";
import { WithOwnerRestaurant } from "@/components/admin/owner-restaurant";
import { Button } from "@/components/ui/button";
import { menuUrl } from "@/lib/restaurant-api";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/restaurant/tables")({
  component: () => (
    <WithOwnerRestaurant>
      {(r) => <TablesManager restaurant={r} />}
    </WithOwnerRestaurant>
  ),
});

function TablesManager({ restaurant: r }: { restaurant: { id: string; name: string; slug: string } }) {
  const [tableCount, setTableCount] = useState(8);
  const [copiedTable, setCopiedTable] = useState<number | null>(null);

  const copyTableLink = (tableNum: number) => {
    const url = `${menuUrl(r.slug)}?table=${tableNum}`;
    navigator.clipboard.writeText(url);
    setCopiedTable(tableNum);
    toast.success(`Copied Table ${tableNum} direct menu link!`);
    setTimeout(() => setCopiedTable(null), 2000);
  };

  const addTable = () => {
    setTableCount((prev) => prev + 1);
    toast.success(`Table ${tableCount + 1} added to dining room layout.`);
  };

  const tablesList = Array.from({ length: tableCount }, (_, i) => ({
    number: i + 1,
    zone: i < 4 ? "Indoor Hall" : i < 6 ? "Patio Terrace" : "Private Dining",
    seats: i % 2 === 0 ? 4 : 2,
  }));

  return (
    <>
      <PageHeader
        title="Table & QR Management"
        description="Print and deploy dynamic QR code table stands for contactless customer ordering."
        actions={
          <Button 
            onClick={addTable}
            className="rounded-xl bg-forest hover:bg-forest/90 text-white font-bold shadow-xs transition-all"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Add Floor Table
          </Button>
        }
      />

      {/* Main Digital QR Card for Restaurant */}
      <RestaurantQrCard />

      {/* Floor Tables Grid */}
      <div className="mt-10 mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">
            Dining Floor Table Stands
          </h2>
          <p className="text-xs text-muted-foreground">
            {tablesList.length} tables active. Each table QR automatically identifies the diner's table number.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {tablesList.map((t) => {
          const directUrl = `${menuUrl(r.slug)}?table=${t.number}`;
          const isCopied = copiedTable === t.number;

          return (
            <div
              key={t.number}
              className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:border-forest/40"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-2xl font-extrabold text-foreground">
                      T{t.number}
                    </p>
                    <span className="inline-block text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full mt-0.5">
                      {t.zone}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    Live QR
                  </span>
                </div>

                {/* QR Preview Box */}
                <div className="my-4 flex aspect-square items-center justify-center rounded-2xl bg-muted/40 border border-border/60 group-hover:bg-forest/5 group-hover:border-forest/20 transition-colors relative overflow-hidden">
                  <QrCode className="h-20 w-20 text-foreground group-hover:text-forest transition-colors" strokeWidth={1.25} />
                  <a
                    href={directUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute inset-0 bg-forest/80 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Test Table QR</span>
                  </a>
                </div>
              </div>

              <div className="pt-2 border-t border-border/60 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Users className="h-3.5 w-3.5 text-muted-foreground/70" />
                    {t.seats} seats
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[100px]">
                    ?table={t.number}
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyTableLink(t.number)}
                  className="w-full h-8 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5"
                >
                  {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{isCopied ? "Link Copied!" : "Copy Table Link"}</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
