-- Grant permissions to public tables
GRANT ALL ON TABLE public.clients TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.products TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.sales TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.sale_items TO anon, authenticated, service_role;

-- Ensure sequences are also granted
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Fix sale_items foreign key to cascade delete (if not already)
ALTER TABLE public.sale_items 
DROP CONSTRAINT IF EXISTS sale_items_sale_id_fkey,
ADD CONSTRAINT sale_items_sale_id_fkey 
  FOREIGN KEY (sale_id) 
  REFERENCES public.sales(id) 
  ON DELETE CASCADE;

-- Ensure RLS is enabled and permissive for preview
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for authenticated and anon" ON public.clients;
CREATE POLICY "Enable all for authenticated and anon" ON public.clients FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for authenticated and anon" ON public.products;
CREATE POLICY "Enable all for authenticated and anon" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for authenticated and anon" ON public.sales;
CREATE POLICY "Enable all for authenticated and anon" ON public.sales FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all for authenticated and anon" ON public.sale_items;
CREATE POLICY "Enable all for authenticated and anon" ON public.sale_items FOR ALL USING (true) WITH CHECK (true);