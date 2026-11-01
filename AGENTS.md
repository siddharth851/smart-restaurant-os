<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## Architecture

- Panels: customer `/menu/$restaurantSlug/*`, admin `/restaurant/*`, kitchen `/kitchen/*`, super admin `/platform/*`; admin/platform share `components/shared/panel-shell.tsx` — keep panels separated by route prefix so later parts can add auth per panel.
- Demo content lives only in `src/lib/demo-data.ts` — swap it for backend queries later without touching page layouts.
- No payment/billing modules (user requirement).
- Auth: panel routes live under `src/routes/_authenticated/` (client-only gate, `ssr: false`); each panel layout checks roles via `PANEL_ROLES` in `src/lib/auth.ts`. Roles are read only from `public.user_roles` — the signup trigger may grant only `restaurant_owner`; super_admin/staff are provisioned server-side.
- Menu data: owner reads/writes go through the browser client in `src/lib/restaurant-api.ts` with RLS (`owns_restaurant()`) as the guard; customer menu reads public rows by slug. Images go in the private `restaurant-media` bucket under `{restaurant_id}/...` (public buckets are blocked by workspace policy); `*_url` columns store object paths, shown via signed URLs.
- Customer orders: guests (no login) insert only via the SECURITY DEFINER `place_order()` RPC, which re-reads prices/availability from `menu_items` and generates the order code; `orders`/`order_items` have no anon table grants, owners read via `owns_restaurant()`. Status changes only via `update_order_status()` (one step forward along received→accepted→preparing→ready→served; no direct UPDATE grant). Guests track via `get_order_status(code)` polled every 4s; kitchen/orders pages use realtime on `orders` plus 15s polling fallback (`src/lib/orders-api.ts`). One QR per restaurant points to `/menu/{slug}`; guests type their table number.
