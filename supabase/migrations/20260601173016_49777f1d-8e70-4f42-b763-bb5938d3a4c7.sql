-- Grant permissions to anon role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sale_items TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Update RLS policies to include anon role
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.clients;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.products;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.sales;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.sale_items;

CREATE POLICY "Enable all for authenticated and anon" ON public.clients
    FOR ALL
    TO authenticated, anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all for authenticated and anon" ON public.products
    FOR ALL
    TO authenticated, anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all for authenticated and anon" ON public.sales
    FOR ALL
    TO authenticated, anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable all for authenticated and anon" ON public.sale_items
    FOR ALL
    TO authenticated, anon
    USING (true)
    WITH CHECK (true);
