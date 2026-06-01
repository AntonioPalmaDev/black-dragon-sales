-- First, add a unique constraint on product name if it doesn't exist to allow ON CONFLICT
-- But wait, maybe I should just check if they exist first. 
-- Actually, let's just use a script to insert them or update them.

DO $$
BEGIN
    -- Fall
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'Fall') THEN
        UPDATE public.products SET cost_price = 75000, sale_price = 150000 WHERE name = 'Fall';
    ELSE
        INSERT INTO public.products (name, cost_price, sale_price, is_active, unit_measure)
        VALUES ('Fall', 75000, 150000, true, 'UN');
    END IF;

    -- AR15
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'AR15') THEN
        UPDATE public.products SET cost_price = 65000, sale_price = 130000 WHERE name = 'AR15';
    ELSE
        INSERT INTO public.products (name, cost_price, sale_price, is_active, unit_measure)
        VALUES ('AR15', 65000, 130000, true, 'UN');
    END IF;

    -- Sig
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'Sig') THEN
        UPDATE public.products SET cost_price = 70000, sale_price = 140000 WHERE name = 'Sig';
    ELSE
        INSERT INTO public.products (name, cost_price, sale_price, is_active, unit_measure)
        VALUES ('Sig', 70000, 140000, true, 'UN');
    END IF;

    -- M4A4
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'M4A4') THEN
        UPDATE public.products SET cost_price = 60000, sale_price = 120000 WHERE name = 'M4A4';
    ELSE
        INSERT INTO public.products (name, cost_price, sale_price, is_active, unit_measure)
        VALUES ('M4A4', 60000, 120000, true, 'UN');
    END IF;

    -- G36C
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'G36C') THEN
        UPDATE public.products SET cost_price = 50000, sale_price = 100000 WHERE name = 'G36C';
    ELSE
        INSERT INTO public.products (name, cost_price, sale_price, is_active, unit_measure)
        VALUES ('G36C', 50000, 100000, true, 'UN');
    END IF;

    -- Evo
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'Evo') THEN
        UPDATE public.products SET cost_price = 30000, sale_price = 60000 WHERE name = 'Evo';
    ELSE
        INSERT INTO public.products (name, cost_price, sale_price, is_active, unit_measure)
        VALUES ('Evo', 30000, 60000, true, 'UN');
    END IF;

    -- MTAR
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'MTAR') THEN
        UPDATE public.products SET cost_price = 30000, sale_price = 60000 WHERE name = 'MTAR';
    ELSE
        INSERT INTO public.products (name, cost_price, sale_price, is_active, unit_measure)
        VALUES ('MTAR', 30000, 60000, true, 'UN');
    END IF;

    -- MP7
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'MP7') THEN
        UPDATE public.products SET cost_price = 27000, sale_price = 54000 WHERE name = 'MP7';
    ELSE
        INSERT INTO public.products (name, cost_price, sale_price, is_active, unit_measure)
        VALUES ('MP7', 27000, 54000, true, 'UN');
    END IF;

    -- Uzi
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'Uzi') THEN
        UPDATE public.products SET cost_price = 27000, sale_price = 54000 WHERE name = 'Uzi';
    ELSE
        INSERT INTO public.products (name, cost_price, sale_price, is_active, unit_measure)
        VALUES ('Uzi', 27000, 54000, true, 'UN');
    END IF;

    -- Five
    IF EXISTS (SELECT 1 FROM public.products WHERE name = 'Five') THEN
        UPDATE public.products SET cost_price = 20000, sale_price = 40000 WHERE name = 'Five';
    ELSE
        INSERT INTO public.products (name, cost_price, sale_price, is_active, unit_measure)
        VALUES ('Five', 20000, 40000, true, 'UN');
    END IF;
END $$;
