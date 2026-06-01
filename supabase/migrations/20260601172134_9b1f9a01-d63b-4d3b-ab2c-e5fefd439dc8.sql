GRANT ALL ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
GRANT SELECT ON public.clients TO anon;

GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
GRANT SELECT ON public.products TO anon;

GRANT ALL ON public.sales TO authenticated;
GRANT ALL ON public.sales TO service_role;
GRANT SELECT ON public.sales TO anon;

GRANT ALL ON public.sale_items TO authenticated;
GRANT ALL ON public.sale_items TO service_role;
GRANT SELECT ON public.sale_items TO anon;

-- Also ensure sequences are accessible if any
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
