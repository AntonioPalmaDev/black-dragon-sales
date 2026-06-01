-- Grant access to all tables for authenticated and service_role
GRANT ALL ON public.clients TO authenticated, service_role;
GRANT ALL ON public.products TO authenticated, service_role;
GRANT ALL ON public.sales TO authenticated, service_role;
GRANT ALL ON public.sale_items TO authenticated, service_role;
GRANT ALL ON public.categories TO authenticated, service_role;
GRANT ALL ON public.activity_logs TO authenticated, service_role;
GRANT ALL ON public.profiles TO authenticated, service_role;
GRANT ALL ON public.user_roles TO authenticated, service_role;

-- Grant SELECT to anon for public tables if needed (optional)
GRANT SELECT ON public.clients TO anon;
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.sales TO anon;
GRANT SELECT ON public.sale_items TO anon;
GRANT SELECT ON public.categories TO anon;

-- Ensure RLS is enabled and policies are permissive for now (as seen in the current policies)
-- The current policies already allow ALL to authenticated where true.
-- Let's make sure we have a policy for service_role too if needed, 
-- though service_role usually bypasses RLS in many setups or needs explicit policy.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'clients' AND policyname = 'Service role access'
    ) THEN
        CREATE POLICY "Service role access" ON public.clients FOR ALL TO service_role USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'products' AND policyname = 'Service role access'
    ) THEN
        CREATE POLICY "Service role access" ON public.products FOR ALL TO service_role USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'sales' AND policyname = 'Service role access'
    ) THEN
        CREATE POLICY "Service role access" ON public.sales FOR ALL TO service_role USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'sale_items' AND policyname = 'Service role access'
    ) THEN
        CREATE POLICY "Service role access" ON public.sale_items FOR ALL TO service_role USING (true);
    END IF;
END
$$;
