CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code text NOT NULL UNIQUE,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  table_number integer NOT NULL CHECK (table_number BETWEEN 1 AND 999),
  customer_name text NOT NULL CHECK (char_length(customer_name) BETWEEN 1 AND 60),
  notes text NOT NULL DEFAULT '' CHECK (char_length(notes) <= 300),
  status text NOT NULL DEFAULT 'received',
  total numeric(10,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX orders_restaurant_idx ON public.orders(restaurant_id, created_at DESC);
CREATE TABLE public.order_items (
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
CREATE INDEX order_items_order_idx ON public.order_items(order_id);
GRANT SELECT, UPDATE ON public.orders TO authenticated;
GRANT SELECT ON public.order_items TO authenticated;
GRANT ALL ON public.orders TO service_role;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read orders" ON public.orders FOR SELECT TO authenticated USING (public.owns_restaurant(restaurant_id) OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Owners update orders" ON public.orders FOR UPDATE TO authenticated USING (public.owns_restaurant(restaurant_id)) WITH CHECK (public.owns_restaurant(restaurant_id));
CREATE POLICY "Owners read order items" ON public.order_items FOR SELECT TO authenticated USING (public.owns_restaurant(restaurant_id) OR public.has_role(auth.uid(), 'super_admin'));
CREATE TRIGGER orders_touch BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Customers (no login) place orders only through this function; prices come from the database.
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