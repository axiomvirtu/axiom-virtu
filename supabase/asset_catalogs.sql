-- TABLE: asset_catalogs
CREATE TABLE public.asset_catalogs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  image_url text NOT NULL,
  level_name text NOT NULL,
  capital_min numeric NOT NULL,
  capital_max numeric NOT NULL,
  ticket_time_start text NOT NULL,
  ticket_time_end text NOT NULL,
  trading_time_start text NOT NULL,
  trading_time_end text NOT NULL,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ENABLE RLS
ALTER TABLE public.asset_catalogs ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "Allow public read access on asset_catalogs" ON public.asset_catalogs FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access on asset_catalogs" ON public.asset_catalogs FOR ALL USING (auth.role() = 'authenticated');
