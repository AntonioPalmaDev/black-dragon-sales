
-- Drop overly permissive policies (public role = includes anon)
DROP POLICY IF EXISTS "Enable all for authenticated and anon" ON public.clients;
DROP POLICY IF EXISTS "Enable all for authenticated and anon" ON public.products;
DROP POLICY IF EXISTS "Enable all for authenticated and anon" ON public.sales;
DROP POLICY IF EXISTS "Enable all for authenticated and anon" ON public.sale_items;

-- Recreate restricted to authenticated only
CREATE POLICY "Authenticated full access" ON public.clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON public.sales FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access" ON public.sale_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Revoke anon grants
REVOKE ALL ON public.clients FROM anon;
REVOKE ALL ON public.products FROM anon;
REVOKE ALL ON public.sales FROM anon;
REVOKE ALL ON public.sale_items FROM anon;

-- Restrict user_roles SELECT to self or admin
DROP POLICY IF EXISTS "Everyone authenticated can see roles" ON public.user_roles;
CREATE POLICY "Users see own roles or admins see all" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

-- Fix mutable search_path on trigger function
CREATE OR REPLACE FUNCTION public.update_stock_on_sale()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.products
        SET stock_current = stock_current - NEW.quantity,
            updated_at = now()
        WHERE id = NEW.product_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.products
        SET stock_current = stock_current + OLD.quantity,
            updated_at = now()
        WHERE id = OLD.product_id;
    END IF;
    RETURN NULL;
END;
$function$;

-- Revoke executable SECURITY DEFINER helpers from anon (still callable internally by RLS/triggers)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
