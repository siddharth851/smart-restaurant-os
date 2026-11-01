-- ==============================================================================
-- SMART RESTAURANT OS - COMPLETE FULL SCHEMA MIGRATION & RECOVERY
-- Target Project: smaziwkpqjlupzbffjmk
-- Run this complete script in the Supabase SQL Editor for your new project
-- ==============================================================================

-- 1. EXTENSIONS & TYPES
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('super_admin', 'restaurant_owner', 'restaurant_staff', 'kitchen_staff');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. TABLES

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- USER ROLES
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RESTAURANTS
CREATE TABLE IF NOT EXISTS public.restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  phone text,
  logo_url text,
  cover_url text,
  address text,
  email text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.restaurants TO anon;
GRANT SELECT, UPDATE ON public.restaurants TO authenticated;
GRANT ALL ON public.restaurants TO service_role;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- MENU CATEGORIES
CREATE TABLE IF NOT EXISTS public.menu_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 60),
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS menu_categories_restaurant_idx ON public.menu_categories(restaurant_id, sort_order);
GRANT SELECT ON public.menu_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_categories TO authenticated;
GRANT ALL ON public.menu_categories TO service_role;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;

-- MENU ITEMS
CREATE TABLE IF NOT EXISTS public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.menu_categories(id) ON DELETE SET NULL,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 500),
  price numeric(10,2) NOT NULL CHECK (price >= 0 AND price <= 1000000),
  image_url text,
  is_veg boolean NOT NULL DEFAULT true,
  is_available boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS menu_items_restaurant_idx ON public.menu_items(restaurant_id, category_id);
GRANT SELECT ON public.menu_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_items TO authenticated;
GRANT ALL ON public.menu_items TO service_role;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code text NOT NULL UNIQUE,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  table_number integer NOT NULL CHECK (table_number BETWEEN 1 AND 999),
  customer_name text NOT NULL CHECK (char_length(customer_name) BETWEEN 1 AND 60),
  notes text NOT NULL DEFAULT '' CHECK (char_length(notes) <= 300),
  status text NOT NULL DEFAULT 'received',
  status_updated_at timestamptz NOT NULL DEFAULT now(),
  total numeric(10,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
DO $$ BEGIN
  ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (status IN ('received','accepted','preparing','ready','served'));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
CREATE INDEX IF NOT EXISTS orders_restaurant_idx ON public.orders(restaurant_id, created_at DESC);
REVOKE ALL ON public.orders FROM anon;
GRANT SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES public.menu_items(id) ON DELETE SET NULL,
  name text NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  quantity integer NOT NULL CHECK (quantity BETWEEN 1 AND 50),
  line_total numeric(10,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON public.order_items(order_id);
REVOKE ALL ON public.order_items FROM anon;
GRANT SELECT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 3. HELPER FUNCTIONS

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT exists (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.owns_restaurant(_restaurant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT exists (SELECT 1 FROM public.restaurants WHERE id = _restaurant_id AND owner_id = auth.uid()) $$;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END $$;

-- 4. TRIGGERS FOR TIMESTAMPS
DROP TRIGGER IF EXISTS profiles_touch ON public.profiles;
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS restaurants_touch ON public.restaurants;
CREATE TRIGGER restaurants_touch BEFORE UPDATE ON public.restaurants FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS menu_categories_touch ON public.menu_categories;
CREATE TRIGGER menu_categories_touch BEFORE UPDATE ON public.menu_categories FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS menu_items_touch ON public.menu_items;
CREATE TRIGGER menu_items_touch BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS orders_touch ON public.orders;
CREATE TRIGGER orders_touch BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 5. AUTH TRIGGER FOR RESTAURANT OWNER SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _rname text := nullif(trim(new.raw_user_meta_data->>'restaurant_name'), '');
  _base text;
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, email)
  VALUES (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.raw_user_meta_data->>'phone', new.email)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, full_name = EXCLUDED.full_name;

  IF _rname IS NOT NULL THEN
    _base := trim(both '-' from regexp_replace(lower(_rname), '[^a-z0-9]+', '-', 'g'));
    IF _base = '' THEN _base := 'restaurant'; END IF;
    INSERT INTO public.restaurants (owner_id, name, slug, phone)
    VALUES (new.id, left(_rname, 120), left(_base, 50) || '-' || substr(replace(new.id::text,'-',''),1,6), new.raw_user_meta_data->>'phone')
    ON CONFLICT (slug) DO NOTHING;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'restaurant_owner')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN new;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. ORDER FUNCTIONS (GUEST & LIFECYCLE)

CREATE OR REPLACE FUNCTION public.place_order(_slug text, _customer_name text, _table_number integer, _items jsonb, _notes text DEFAULT '')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _rid uuid; _oid uuid; _code text; _total numeric := 0; _line record; _mi record; _name text := btrim(coalesce(_customer_name,''));
BEGIN
  SELECT id INTO _rid FROM restaurants WHERE slug = _slug;
  IF _rid IS NULL THEN RAISE EXCEPTION 'Restaurant not found'; END IF;
  IF char_length(_name) < 1 OR char_length(_name) > 60 THEN RAISE EXCEPTION 'Please enter your name (max 60 characters)'; END IF;
  IF _table_number IS NULL OR _table_number < 1 OR _table_number > 999 THEN RAISE EXCEPTION 'Please enter a valid table number'; END IF;
  IF jsonb_typeof(_items) <> 'array' OR jsonb_array_length(_items) = 0 OR jsonb_array_length(_items) > 50 THEN RAISE EXCEPTION 'Your cart is empty'; END IF;
  FOR _line IN SELECT (e->>'id')::uuid AS id, (e->>'qty')::int AS qty FROM jsonb_array_elements(_items) e LOOP
    IF _line.qty IS NULL OR _line.qty < 1 OR _line.qty > 50 THEN RAISE EXCEPTION 'Invalid quantity'; END IF;
    SELECT * INTO _mi FROM menu_items WHERE id = _line.id AND restaurant_id = _rid;
    IF NOT FOUND THEN RAISE EXCEPTION 'A dish in your cart is no longer on the menu'; END IF;
    IF NOT _mi.is_available THEN RAISE EXCEPTION '% is out of stock', _mi.name; END IF;
    _total := _total + _mi.price * _line.qty;
  END LOOP;
  LOOP
    _code := 'ORD-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM orders WHERE order_code = _code);
  END LOOP;
  INSERT INTO orders(order_code, restaurant_id, table_number, customer_name, notes, total)
  VALUES (_code, _rid, _table_number, _name, left(btrim(coalesce(_notes,'')),300), _total) RETURNING id INTO _oid;
  INSERT INTO order_items(order_id, restaurant_id, menu_item_id, name, unit_price, quantity, line_total)
  SELECT _oid, _rid, m.id, m.name, m.price, (e->>'qty')::int, m.price * (e->>'qty')::int
  FROM jsonb_array_elements(_items) e JOIN menu_items m ON m.id = (e->>'id')::uuid;
  RETURN jsonb_build_object('order_code', _code, 'total', _total, 'created_at', now());
END $$;
REVOKE ALL ON FUNCTION public.place_order(text,text,integer,jsonb,text) FROM public;
GRANT EXECUTE ON FUNCTION public.place_order(text,text,integer,jsonb,text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.update_order_status(_order_id uuid, _status text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _rid uuid; _cur text; _flow text[] := ARRAY['received','accepted','preparing','ready','served'];
BEGIN
  SELECT restaurant_id, status INTO _rid, _cur FROM orders WHERE id = _order_id;
  IF _rid IS NULL OR NOT public.owns_restaurant(_rid) THEN RAISE EXCEPTION 'Order not found'; END IF;
  IF array_position(_flow, _status) IS NULL THEN RAISE EXCEPTION 'Invalid status'; END IF;
  IF array_position(_flow, _status) <> array_position(_flow, _cur) + 1 THEN RAISE EXCEPTION 'Order is already %', _cur; END IF;
  UPDATE orders SET status = _status, status_updated_at = now() WHERE id = _order_id;
  RETURN _status;
END $$;
REVOKE ALL ON FUNCTION public.update_order_status(uuid,text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.update_order_status(uuid,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_order_status(_code text)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'order_code', o.order_code, 'status', o.status, 'status_updated_at', o.status_updated_at,
    'table_number', o.table_number, 'customer_name', o.customer_name, 'notes', o.notes,
    'total', o.total, 'created_at', o.created_at, 'restaurant_name', r.name, 'slug', r.slug,
    'items', coalesce((SELECT jsonb_agg(jsonb_build_object('name', i.name, 'qty', i.quantity, 'price', i.unit_price) ORDER BY i.created_at) FROM order_items i WHERE i.order_id = o.id), '[]'::jsonb))
  FROM orders o JOIN restaurants r ON r.id = o.restaurant_id WHERE o.order_code = upper(btrim(_code))
$$;
REVOKE ALL ON FUNCTION public.get_order_status(text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_order_status(text) TO anon, authenticated;

-- 7. ROW LEVEL SECURITY POLICIES

-- Profiles
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- User Roles
DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));

-- Restaurants
DROP POLICY IF EXISTS "Public reads restaurants" ON public.restaurants;
CREATE POLICY "Public reads restaurants" ON public.restaurants FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Owners read own restaurant" ON public.restaurants;
CREATE POLICY "Owners read own restaurant" ON public.restaurants FOR SELECT TO authenticated USING (owner_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));
DROP POLICY IF EXISTS "Owners update own restaurant" ON public.restaurants;
CREATE POLICY "Owners update own restaurant" ON public.restaurants FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- Menu Categories
DROP POLICY IF EXISTS "Public reads categories" ON public.menu_categories;
CREATE POLICY "Public reads categories" ON public.menu_categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Owners insert categories" ON public.menu_categories;
CREATE POLICY "Owners insert categories" ON public.menu_categories FOR INSERT TO authenticated WITH CHECK (public.owns_restaurant(restaurant_id));
DROP POLICY IF EXISTS "Owners update categories" ON public.menu_categories;
CREATE POLICY "Owners update categories" ON public.menu_categories FOR UPDATE TO authenticated USING (public.owns_restaurant(restaurant_id)) WITH CHECK (public.owns_restaurant(restaurant_id));
DROP POLICY IF EXISTS "Owners delete categories" ON public.menu_categories;
CREATE POLICY "Owners delete categories" ON public.menu_categories FOR DELETE TO authenticated USING (public.owns_restaurant(restaurant_id));

-- Menu Items
DROP POLICY IF EXISTS "Public reads items" ON public.menu_items;
CREATE POLICY "Public reads items" ON public.menu_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Owners insert items" ON public.menu_items;
CREATE POLICY "Owners insert items" ON public.menu_items FOR INSERT TO authenticated WITH CHECK (public.owns_restaurant(restaurant_id));
DROP POLICY IF EXISTS "Owners update items" ON public.menu_items;
CREATE POLICY "Owners update items" ON public.menu_items FOR UPDATE TO authenticated USING (public.owns_restaurant(restaurant_id)) WITH CHECK (public.owns_restaurant(restaurant_id));
DROP POLICY IF EXISTS "Owners delete items" ON public.menu_items;
CREATE POLICY "Owners delete items" ON public.menu_items FOR DELETE TO authenticated USING (public.owns_restaurant(restaurant_id));

-- Orders
DROP POLICY IF EXISTS "Owners read orders" ON public.orders;
CREATE POLICY "Owners read orders" ON public.orders FOR SELECT TO authenticated USING (public.owns_restaurant(restaurant_id) OR public.has_role(auth.uid(), 'super_admin'));

-- Order Items
DROP POLICY IF EXISTS "Owners read order items" ON public.order_items;
CREATE POLICY "Owners read order items" ON public.order_items FOR SELECT TO authenticated USING (public.owns_restaurant(restaurant_id) OR public.has_role(auth.uid(), 'super_admin'));

-- 8. STORAGE BUCKET & STORAGE POLICIES
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-media', 'restaurant-media', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone reads restaurant media" ON storage.objects;
CREATE POLICY "Anyone reads restaurant media" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'restaurant-media');

DROP POLICY IF EXISTS "Owners upload restaurant media" ON storage.objects;
CREATE POLICY "Owners upload restaurant media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'restaurant-media' AND public.owns_restaurant(((storage.foldername(name))[1])::uuid));

DROP POLICY IF EXISTS "Owners update restaurant media" ON storage.objects;
CREATE POLICY "Owners update restaurant media" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'restaurant-media' AND public.owns_restaurant(((storage.foldername(name))[1])::uuid));

DROP POLICY IF EXISTS "Owners delete restaurant media" ON storage.objects;
CREATE POLICY "Owners delete restaurant media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'restaurant-media' AND public.owns_restaurant(((storage.foldername(name))[1])::uuid));

-- 9. REALTIME PUBLICATION
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 10. SEED DATA RESTORATION (PRESERVING EXISTING DATA)

-- Restoring Restaurants (16 rows)
INSERT INTO public.restaurants (id, owner_id, name, slug, phone, logo_url, cover_url, address, email, description, created_at, updated_at)
VALUES ('4ac0cfd5-f6a0-4475-b435-6e37648a2c89', '2d677757-345c-42e5-a7cc-2c1b1af38bed', 'E2E Bistro', 'e2e-bistro-2d6777', '+91 98765 43210', '4ac0cfd5-f6a0-4475-b435-6e37648a2c89/brand/40079615-f311-4615-815b-4ee53de2e935.jpg', '4ac0cfd5-f6a0-4475-b435-6e37648a2c89/brand/b171e689-26ef-40b8-9325-cfafe37ecb95.jpg', '42 MG Road, Bengaluru', 'hello@e2ebistro.in', 'Coastal plates & filter coffee', '2026-10-30T21:05:47.134768+00:00', '2026-10-30T21:24:39.967856+00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.restaurants (id, owner_id, name, slug, phone, logo_url, cover_url, address, email, description, created_at, updated_at)
VALUES ('d99eafcc-ca5f-4068-846e-fec8f47afdc5', 'ed26f46f-9b03-407f-8c52-88ca201267eb', 'pw ioi', 'pw-ioi-ed26f4', '+919115057530', NULL, NULL, NULL, NULL, NULL, '2026-10-30T21:43:47.848939+00:00', '2026-10-30T21:43:47.848939+00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.restaurants (id, owner_id, name, slug, phone, logo_url, cover_url, address, email, description, created_at, updated_at)
VALUES ('18a7c6e6-ff09-49a0-aded-ce88886d2153', '801e3e38-dcb4-4298-bde2-3438070c260f', 'pw ioi', 'pw-ioi-801e3e', '6789567845', NULL, NULL, NULL, NULL, NULL, '2026-10-31T11:40:13.909626+00:00', '2026-10-31T11:40:13.909626+00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.restaurants (id, owner_id, name, slug, phone, logo_url, cover_url, address, email, description, created_at, updated_at)
VALUES ('0b52862f-49f0-4638-9642-14693bbf9051', '320e34a5-46d2-4a46-8e8d-674e6af7a8eb', 'Royal Spice Bistro', 'royal-spice-bistro-320e34', '+919876543210', NULL, NULL, NULL, NULL, NULL, '2026-10-31T11:55:42.02737+00:00', '2026-10-31T11:55:42.02737+00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.restaurants (id, owner_id, name, slug, phone, logo_url, cover_url, address, email, description, created_at, updated_at)
VALUES ('1738bdfa-f5f2-4502-9967-53e3788ad3c4', '93cc42e3-3b34-49cd-bef6-7678abf0673e', 'Inspection Bistro', 'inspection-bistro-93cc42', '+919876543210', NULL, NULL, NULL, NULL, NULL, '2026-10-31T11:57:51.615992+00:00', '2026-10-31T11:57:51.615992+00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.restaurants (id, owner_id, name, slug, phone, logo_url, cover_url, address, email, description, created_at, updated_at)
VALUES ('184b3839-5f5a-487e-886d-34a6c2d995d4', 'd9886862-5512-47c3-bcf9-dcf598e153e3', 'Royal Spice Bistro', 'royal-spice-bistro-d98868', '+919876543210', NULL, NULL, NULL, NULL, NULL, '2026-10-31T14:09:03.464096+00:00', '2026-10-31T14:09:03.464096+00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.restaurants (id, owner_id, name, slug, phone, logo_url, cover_url, address, email, description, created_at, updated_at)
VALUES ('7e864962-054f-4173-8720-9231bc1fe5a6', 'b0e05be3-4a65-41ec-aebb-cf72d131e5a2', 'demohai', 'demohai-b0e05b', '+917309164367', NULL, NULL, NULL, NULL, NULL, '2026-10-31T14:43:53.422321+00:00', '2026-10-31T14:43:53.422321+00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.restaurants (id, owner_id, name, slug, phone, logo_url, cover_url, address, email, description, created_at, updated_at)
VALUES ('69fac70b-37de-4465-90c4-b309fee30826', '1f26180b-a342-4426-8d69-584ce88b1f67', 'DineOS Trattoria', 'dineos-trattoria-1f2618', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-01T05:50:44.40763+00:00', '2026-11-01T05:50:44.40763+00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.restaurants (id, owner_id, name, slug, phone, logo_url, cover_url, address, email, description, created_at, updated_at)
VALUES ('7c66e295-6fb0-4bf3-a00b-1693ff719b4f', '7e9223b0-20fd-48cf-9d2b-67a5036d1044', 'hjwdb', 'hjwdb-7e9223', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-01T06:40:38.931066+00:00', '2026-11-01T06:40:38.931066+00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.restaurants (id, owner_id, name, slug, phone, logo_url, cover_url, address, email, description, created_at, updated_at)
VALUES ('7e93189d-61de-455f-ba30-a1969ea3cde1', 'dee3304c-c0aa-4a85-a3e8-4c90fa8be9ea', 'hjwdb', 'hjwdb-dee330', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-01T07:07:45.066737+00:00', '2026-11-01T07:07:45.066737+00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.restaurants (id, owner_id, name, slug, phone, logo_url, cover_url, address, email, description, created_at, updated_at)
VALUES ('416fd1a3-4a9d-4e92-b145-e217910b04a8', '8f2ba1e3-5e5f-4554-812f-b53a97d8822b', 'hbtrfthghv', 'hbtrfthghv-8f2ba1', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-01T07:11:24.745818+00:00', '2026-11-01T07:11:24.745818+00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.restaurants (id, owner_id, name, slug, phone, logo_url, cover_url, address, email, description, created_at, updated_at)
VALUES ('879d79ef-05a0-43c4-8e3c-81d649d38b5f', 'dc9d680d-94b9-4c09-b993-eb2c6eb4cc5a', 'Test Auto Cafe', 'test-auto-cafe-dc9d68', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-01T07:19:39.196524+00:00', '2026-11-01T07:19:39.196524+00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.restaurants (id, owner_id, name, slug, phone, logo_url, cover_url, address, email, description, created_at, updated_at)
VALUES ('3000efd0-cac5-4e3e-84e2-d32cfada8212', '7e75bd2d-b805-41e4-b4cb-d0f297eb6402', 'Test Diner', 'test-diner-7e75bd', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-01T07:22:39.481964+00:00', '2026-11-01T07:22:39.481964+00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.restaurants (id, owner_id, name, slug, phone, logo_url, cover_url, address, email, description, created_at, updated_at)
VALUES ('d28edbc9-7491-4eae-a07c-14d638dd9ee7', '954c1949-8898-4352-abd5-9a903e7fc5bd', 'Live Test Grill', 'live-test-grill-954c19', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-01T07:29:11.048771+00:00', '2026-11-01T07:29:11.048771+00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.restaurants (id, owner_id, name, slug, phone, logo_url, cover_url, address, email, description, created_at, updated_at)
VALUES ('f8e5d476-ea2e-4485-831e-d619a06b9b1c', '6726eda2-045a-413f-9a7d-583e49be3c1b', 'Test', 'test-6726ed', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-01T07:29:25.162699+00:00', '2026-11-01T07:29:25.162699+00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.restaurants (id, owner_id, name, slug, phone, logo_url, cover_url, address, email, description, created_at, updated_at)
VALUES ('d00a7547-e85e-410a-b658-044c275f083d', '8456af04-257d-422d-b2e2-bce2b416225e', 'Fresh Bistro', 'fresh-bistro-8456af', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-01T07:29:49.192196+00:00', '2026-11-01T07:29:49.192196+00:00')
ON CONFLICT (id) DO NOTHING;

-- Restoring Menu Categories (2 rows)
INSERT INTO public.menu_categories (id, restaurant_id, name, sort_order, created_at, updated_at)
VALUES ('9704a2d3-45b9-45c7-811a-f2ab0578512f', '4ac0cfd5-f6a0-4475-b435-6e37648a2c89', 'Breakfast', 0, '2026-10-30T21:24:15.22882+00:00', '2026-10-30T21:24:15.22882+00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.menu_categories (id, restaurant_id, name, sort_order, created_at, updated_at)
VALUES ('6f0b6654-81b6-4a9b-a32f-7d0ae846575f', '4ac0cfd5-f6a0-4475-b435-6e37648a2c89', 'Drinks', 1, '2026-10-30T21:24:16.496972+00:00', '2026-10-30T21:24:44.864121+00:00')
ON CONFLICT (id) DO NOTHING;

-- Restoring Menu Items (6 rows)
INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_veg, is_available, sort_order, created_at, updated_at)
VALUES ('a99b28df-38ee-43bc-a37a-f6362f842284', '4ac0cfd5-f6a0-4475-b435-6e37648a2c89', '9704a2d3-45b9-45c7-811a-f2ab0578512f', 'Chicken Ghee Roast', 'House chicken ghee roast', 420, NULL, false, true, 0, '2026-10-30T21:25:00.932277+00:00', '2026-10-30T21:25:00.932277+00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_veg, is_available, sort_order, created_at, updated_at)
VALUES ('65e9f99f-b1cf-44a7-8fdf-757192299d7e', '4ac0cfd5-f6a0-4475-b435-6e37648a2c89', '9704a2d3-45b9-45c7-811a-f2ab0578512f', 'Masala Dosa', 'House masala dosa', 195.5, '4ac0cfd5-f6a0-4475-b435-6e37648a2c89/items/e4eb8922-b1db-4a19-8bd2-6433beab6d60.jpg', true, true, 0, '2026-10-30T21:24:56.28496+00:00', '2026-10-30T21:25:02.827073+00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_veg, is_available, sort_order, created_at, updated_at)
VALUES ('654ca00e-f8f2-4a5e-93f5-72c924368e31', '4ac0cfd5-f6a0-4475-b435-6e37648a2c89', '6f0b6654-81b6-4a9b-a32f-7d0ae846575f', 'Filter Coffee', 'House filter coffee', 60, NULL, true, false, 0, '2026-10-30T21:24:58.939525+00:00', '2026-10-30T21:25:03.668833+00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_veg, is_available, sort_order, created_at, updated_at)
VALUES ('fb2989be-8a3f-44d8-9a7d-902ecb004d97', 'd99eafcc-ca5f-4068-846e-fec8f47afdc5', NULL, 'samosa', 'khane ke liye', 49, NULL, true, true, 0, '2026-10-30T21:47:39.010243+00:00', '2026-10-30T21:47:39.010243+00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_veg, is_available, sort_order, created_at, updated_at)
VALUES ('7e54ae0c-4f9d-4190-aa0d-5d9488598cbd', 'd99eafcc-ca5f-4068-846e-fec8f47afdc5', NULL, 'Ghee', 'khatam ho gya ho to lelo', 100, NULL, true, true, 0, '2026-10-30T21:49:03.865721+00:00', '2026-10-30T21:49:03.865721+00:00')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_veg, is_available, sort_order, created_at, updated_at)
VALUES ('d7820335-b79b-4c3f-93b4-1ba91916f0b3', 'd99eafcc-ca5f-4068-846e-fec8f47afdc5', NULL, 'khana', 'bhookh lagi ho to order kar lo', 500, NULL, true, true, 0, '2026-10-30T21:49:42.79275+00:00', '2026-10-30T21:49:42.79275+00:00')
ON CONFLICT (id) DO NOTHING;
