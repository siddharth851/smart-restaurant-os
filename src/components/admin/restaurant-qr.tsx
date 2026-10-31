import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Copy, Download, ExternalLink, Loader2, Sparkles, QrCode } from "lucide-react";
import { toast } from "sonner";
import { WithOwnerRestaurant } from "@/components/admin/owner-restaurant";
import { menuUrl } from "@/lib/restaurant-api";
import { Button } from "@/components/ui/button";

/** One QR per restaurant, linking to /menu/{slug}. Customers enter their table number on the menu. */
export function RestaurantQrCard() {
  return <WithOwnerRestaurant>{(r) => <QrInner slug={r.slug} name={r.name} />}</WithOwnerRestaurant>;
}

function QrInner({ slug, name }: { slug: string; name: string }) {
  const [url, setUrl] = useState("");
  const [png, setPng] = useState<string | null>(null);

  useEffect(() => {
    const u = menuUrl(slug);
    setUrl(u);
    QRCode.toDataURL(u, {
      width: 1024,
      margin: 2,
      errorCorrectionLevel: "H",
      color: { dark: "#062b21", light: "#FFFFFF" },
    })
      .then(setPng)
      .catch(() => toast.error("Couldn't generate the QR code"));
  }, [slug]);

  const download = () => {
    if (!png) return;
    const a = document.createElement("a");
    a.href = png;
    a.download = `${slug}-menu-qr.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast.success("High-res QR code downloaded");
  };

  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-xs sm:flex-row sm:items-center">
      {/* QR Code Container */}
      <div className="relative mx-auto flex h-52 w-52 shrink-0 items-center justify-center rounded-2xl border-2 border-stone-200 bg-white p-3 shadow-sm sm:mx-0">
        {png ? (
          <img
            src={png}
            alt={`QR code for ${name} menu`}
            className="h-full w-full object-contain rounded-xl"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            <span className="text-[11px] text-stone-400">Generating QR…</span>
          </div>
        )}
      </div>

      {/* Info & Actions */}
      <div className="min-w-0 flex-1 space-y-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200/60 mb-2">
            <Sparkles className="h-3 w-3" /> Digital Table Stand QR
          </div>
          <h2 className="font-display text-xl font-bold text-stone-900">
            {name} Public Menu QR
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed mt-1">
            Print this single QR code for your tabletop acrylic stands. Guests scan it with their phone camera, enter their table number, and order instantly.
          </p>
        </div>

        <div className="rounded-xl bg-stone-50 border border-stone-200 p-2.5 flex items-center justify-between gap-2">
          <p className="truncate font-mono text-xs text-stone-700 select-all" title={url}>
            {url}
          </p>
          <button
            onClick={() =>
              navigator.clipboard.writeText(url).then(() => toast.success("Menu URL copied to clipboard"))
            }
            className="shrink-0 p-1 rounded-md text-stone-500 hover:text-stone-900 hover:bg-stone-200/70 transition-colors"
            title="Copy URL"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <Button
            onClick={download}
            disabled={!png}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-xs text-xs sm:text-sm h-10 px-4"
          >
            <Download className="h-4 w-4 mr-1.5" /> Download High-Res PNG
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              navigator.clipboard.writeText(url).then(() => toast.success("Menu link copied"))
            }
            className="rounded-xl border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold text-xs sm:text-sm h-10"
          >
            <Copy className="h-4 w-4 mr-1.5" /> Copy Link
          </Button>
          <Button
            variant="ghost"
            asChild
            className="rounded-xl text-stone-600 hover:text-stone-900 text-xs sm:text-sm h-10"
          >
            <a href={url} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4 mr-1.5" /> Open in New Tab
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
