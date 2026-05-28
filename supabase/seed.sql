-- Seed file untuk data awal harga
-- Jalankan ini di Supabase SQL Editor setelah schema dibuat.

INSERT INTO public.prices (
  ton_idr_market,
  ton_idr_buy,
  ton_idr_sell,
  source
) VALUES (
  80000.00,
  82000.00,
  78000.00,
  'coingecko'
);
