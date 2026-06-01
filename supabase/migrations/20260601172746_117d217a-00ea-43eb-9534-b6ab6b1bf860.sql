-- Ensure grants for authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sale_items TO authenticated;

-- Ensure grants for service role (used by Lovable tools)
GRANT ALL ON public.clients TO service_role;
GRANT ALL ON public.products TO service_role;
GRANT ALL ON public.sales TO service_role;
GRANT ALL ON public.sale_items TO service_role;

-- Ensure sequences are also granted
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
