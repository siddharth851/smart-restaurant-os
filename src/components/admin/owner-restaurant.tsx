import { useRouteContext } from "@tanstack/react-router";
import { useRef, useState, type ReactNode } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useMyRestaurant, validateImage } from "@/lib/restaurant-api";
import { Panel } from "@/components/shared/ui-bits";
import { cn } from "@/lib/utils";

/** Loads the signed-in owner's restaurant (RLS-scoped) and renders children with it. */
export function WithOwnerRestaurant({ children }: { children: (r: NonNullable<ReturnType<typeof useMyRestaurant>["data"]>, userId: string) => ReactNode }) {
  const { auth } = useRouteContext({ from: "/_authenticated" });
  const { data, isLoading, isError, error } = useMyRestaurant(auth.userId);
  if (isLoading)
    return (
      <div className="grid place-items-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  if (isError) return <Panel><p className="text-sm text-destructive">Couldn't load your restaurant: {error.message}</p></Panel>;
  if (!data)
    return (
      <Panel>
        <p className="font-semibold">No restaurant linked to this account</p>
        <p className="mt-1 text-sm text-muted-foreground">Menu editing is available to restaurant owners. Staff access to shared restaurants arrives in a later update.</p>
      </Panel>
    );
  return <>{children(data, auth.userId)}</>;
}

export function ImageField({
  label,
  previewSrc,
  onPick,
  onClear,
  aspect = "square",
  error,
}: {
  label: string;
  previewSrc: string | null;
  onPick: (file: File) => void;
  onClear?: (() => void) | undefined;
  aspect?: "square" | "wide";
  error?: string | undefined;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [localErr, setLocalErr] = useState<string | null>(null);
  const msg = localErr ?? error;
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{label}</p>
      <div className={cn("relative overflow-hidden rounded-xl border-2 border-dashed bg-muted/50", aspect === "wide" ? "aspect-[16/7]" : "aspect-square max-w-40")}>
        {previewSrc ? (
          <img src={previewSrc} alt="" className="h-full w-full object-cover" />
        ) : (
          <button type="button" onClick={() => ref.current?.click()} className="flex h-full w-full flex-col items-center justify-center gap-1 text-xs text-muted-foreground">
            <ImagePlus className="h-6 w-6" /> Upload image
          </button>
        )}
        {previewSrc && (
          <div className="absolute right-2 top-2 flex gap-1">
            <button type="button" onClick={() => ref.current?.click()} className="rounded-lg bg-card/90 px-2 py-1 text-xs font-semibold shadow-soft">Change</button>
            {onClear && (
              <button type="button" onClick={onClear} className="grid h-7 w-7 place-items-center rounded-lg bg-card/90 shadow-soft" aria-label="Remove image"><X className="h-3.5 w-3.5" /></button>
            )}
          </div>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        aria-label={label}
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          const err = validateImage(f);
          setLocalErr(err);
          if (!err) onPick(f);
        }}
      />
      <p className={cn("mt-1.5 text-xs", msg ? "font-medium text-destructive" : "text-muted-foreground")}>{msg ?? "JPG, PNG or WebP, up to 5 MB"}</p>
    </div>
  );
}
