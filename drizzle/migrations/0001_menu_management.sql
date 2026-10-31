alter table public.restaurants
  add column if not exists logo_url text,
  add column if not exists cover_url text,
  add column if not exists address text,
  add column if not exists email text,
  add column if not exists description text;

create or replace function public.owns_restaurant(_restaurant_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.restaurants where id = _restaurant_id and owner_id = auth.uid()) $$;

create table public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.menu_categories(restaurant_id, sort_order);
grant select on public.menu_categories to anon;
grant select, insert, update, delete on public.menu_categories to authenticated;
grant all on public.menu_categories to service_role;
alter table public.menu_categories enable row level security;
create policy "Public reads categories" on public.menu_categories for select to anon, authenticated using (true);
create policy "Owners insert categories" on public.menu_categories for insert to authenticated with check (public.owns_restaurant(restaurant_id));
create policy "Owners update categories" on public.menu_categories for update to authenticated using (public.owns_restaurant(restaurant_id)) with check (public.owns_restaurant(restaurant_id));
create policy "Owners delete categories" on public.menu_categories for delete to authenticated using (public.owns_restaurant(restaurant_id));

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  category_id uuid references public.menu_categories(id) on delete set null,
  name text not null check (char_length(name) between 1 and 100),
  description text not null default '' check (char_length(description) <= 500),
  price numeric(10,2) not null check (price >= 0 and price <= 1000000),
  image_url text,
  is_veg boolean not null default true,
  is_available boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.menu_items(restaurant_id, category_id);
grant select on public.menu_items to anon;
grant select, insert, update, delete on public.menu_items to authenticated;
grant all on public.menu_items to service_role;
alter table public.menu_items enable row level security;
create policy "Public reads items" on public.menu_items for select to anon, authenticated using (true);
create policy "Owners insert items" on public.menu_items for insert to authenticated with check (public.owns_restaurant(restaurant_id));
create policy "Owners update items" on public.menu_items for update to authenticated using (public.owns_restaurant(restaurant_id)) with check (public.owns_restaurant(restaurant_id));
create policy "Owners delete items" on public.menu_items for delete to authenticated using (public.owns_restaurant(restaurant_id));

create trigger menu_categories_touch before update on public.menu_categories for each row execute function public.touch_updated_at();
create trigger menu_items_touch before update on public.menu_items for each row execute function public.touch_updated_at();

-- Customer menu: anyone can read restaurant public profile
grant select on public.restaurants to anon;
create policy "Public reads restaurants" on public.restaurants for select to anon, authenticated using (true);