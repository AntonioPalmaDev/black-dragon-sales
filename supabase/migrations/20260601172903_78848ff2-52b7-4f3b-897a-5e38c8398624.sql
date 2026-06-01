-- Drop existing permissive policies to recreate them correctly
DROP POLICY IF EXISTS "Standard ERP access" ON public.clients;
DROP POLICY IF EXISTS "Standard ERP access" ON public.products;
DROP POLICY IF EXISTS "Standard ERP access" ON public.sales;
DROP POLICY IF EXISTS "Standard ERP access" ON public.sale_items;

-- Create new policies with explicit USING and WITH CHECK
CREATE POLICY "Enable all for authenticated users" ON public.clients
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON public.products
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON public.sales
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON public.sale_items
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Also for service role
DROP POLICY IF EXISTS "Service role access" ON public.clients;
DROP POLICY IF EXISTS "Service role access" ON public.products;
DROP POLICY IF EXISTS "Service role access" ON public.sales;
DROP POLICY IF EXISTS "Service role access" ON public.sale_items;

CREATE POLICY "Enable all for service_role" ON public.clients FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for service_role" ON public.products FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for service_role" ON public.sales FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for service_role" ON public.sale_items FOR ALL TO service_role USING (true) WITH CHECK (true);
