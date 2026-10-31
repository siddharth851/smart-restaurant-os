ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (status IN ('received','accepted','preparing','ready','served')) NOT VALID;
ALTER TABLE public.orders VALIDATE CONSTRAINT orders_status_check;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status_updated_at timestamptz NOT NULL DEFAULT now();

-- Owners change status only through update_order_status (no direct column edits like total).
DROP POLICY IF EXISTS "Owners update orders" ON public.orders;
REVOKE UPDATE ON public.orders FROM authenticated;

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

-- Guests track their own order by its unguessable code (no login, no table access).
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

ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;