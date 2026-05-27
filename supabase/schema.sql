-- =================================================================
-- BURSA VIRTUAL P2P & INTERNAL MONEY CHANGER
-- Supabase PostgreSQL DDL Schema
-- Versi: 1.0.0
-- Eksekusi di: Supabase SQL Editor
-- =================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =================================================================
-- TABEL: users
-- Menyimpan data akun pengguna Telegram.
-- Anti-Cloning: setiap kolom identitas (telegram_id, wallet,
-- bank_account, device_fingerprint) bersifat UNIQUE.
-- =================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id         BIGINT        NOT NULL UNIQUE,
  username            TEXT,
  first_name          TEXT,
  last_name           TEXT,
  avatar_url          TEXT,

  -- Anti-Cloning: 1 Wallet = 1 Akun
  wallet_address      TEXT          UNIQUE,
  -- Anti-Cloning: 1 Rekening Bank = 1 Akun
  bank_account        TEXT          UNIQUE,
  bank_name           TEXT,
  -- Anti-Cloning: 1 Perangkat Fisik = 1 Akun (FingerprintJS)
  device_fingerprint  TEXT          UNIQUE,

  -- Saldo internal IDR (dalam satuan rupiah, integer untuk hindari float error)
  balance_idr         BIGINT        NOT NULL DEFAULT 0,
  -- Saldo TON yang sedang "on-hold" / dalam proses
  balance_ton_pending NUMERIC(18,9) NOT NULL DEFAULT 0,

  -- Jumlah aset aktif (dibatasi 3-5 sesuai aturan bisnis)
  active_asset_count  SMALLINT      NOT NULL DEFAULT 0,

  -- Status akun: active | suspended | banned
  status              TEXT          NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'suspended', 'banned')),

  -- Role: user | admin
  role                TEXT          NOT NULL DEFAULT 'user'
                        CHECK (role IN ('user', 'admin')),

  -- Referral system
  referral_code       TEXT          UNIQUE DEFAULT upper(substring(gen_random_uuid()::text, 1, 8)),
  referred_by         UUID          REFERENCES public.users(id) ON DELETE SET NULL,

  created_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_users_telegram_id  ON public.users (telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_status        ON public.users (status);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON public.users (referral_code);

-- Trigger auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =================================================================
-- TABEL: prices
-- Cache kurs TON/IDR dari CoinGecko.
-- Di-refresh oleh Cron Job setiap 1 menit.
-- User HANYA boleh membaca dari tabel ini.
-- =================================================================
CREATE TABLE IF NOT EXISTS public.prices (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Kurs pasar mentah dari CoinGecko
  ton_idr_market    NUMERIC(18,2) NOT NULL,

  -- Harga jual Admin (user deposit TON -> IDR): market + spread
  -- Spread flat = Rp 2.000/TON  =>  Beli TON: Rp 81.000
  ton_idr_buy       NUMERIC(18,2) NOT NULL,  -- harga beli TON (user beli dari admin)

  -- Harga beli Admin (user withdraw TON -> IDR): market - spread
  -- Jual TON: Rp 79.000
  ton_idr_sell      NUMERIC(18,2) NOT NULL,  -- harga jual TON (user jual ke admin)

  -- Metadata sumber
  source            TEXT          NOT NULL DEFAULT 'coingecko',
  fetched_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),

  -- Price lock: kurs dikunci selama 60 detik di UI sebelum diperbarui
  locked_until      TIMESTAMPTZ   GENERATED ALWAYS AS (fetched_at + INTERVAL '60 seconds') STORED
);

-- Hanya simpan 1 baris harga aktif + histori untuk audit
CREATE INDEX IF NOT EXISTS idx_prices_fetched_at ON public.prices (fetched_at DESC);

-- Row Level Security: semua user hanya bisa SELECT
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prices_select_all" ON public.prices
  FOR SELECT USING (true);

-- =================================================================
-- TABEL: assets
-- Menyimpan aset virtual yang dimiliki setiap user.
-- Ada 5 Tahap pertumbuhan, nilai compounding +10% per putaran.
-- =================================================================
CREATE TABLE IF NOT EXISTS public.assets (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id          UUID          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Tahap 1-5: menentukan nilai dasar aset
  -- Tahap 1 = 10 TON, Tahap 2 = 11 TON, dst. (+10% compounding)
  stage             SMALLINT      NOT NULL DEFAULT 1
                      CHECK (stage BETWEEN 1 AND 5),

  -- Putaran dalam tahap yang sama (untuk tracking compounding)
  round             SMALLINT      NOT NULL DEFAULT 1,

  -- Nilai aset saat ini dalam TON
  current_value_ton NUMERIC(18,9) NOT NULL DEFAULT 10,

  -- Nilai aset saat ini dalam IDR (snapshot saat pembelian/update)
  current_value_idr BIGINT,

  -- Status aset:
  --   listed      : sedang terdaftar di bursa (menunggu pembeli)
  --   sold        : sudah terjual (transaksi P2P selesai)
  --   holding     : dimiliki user, belum dilempar ke bursa
  --   auto_split  : terkena protokol darurat 50:50
  --   cancelled   : dibatalkan
  status            TEXT          NOT NULL DEFAULT 'holding'
                      CHECK (status IN ('listed', 'sold', 'holding', 'auto_split', 'cancelled')),

  -- Referensi tiket gacha yang memenangkan aset ini
  ticket_id         UUID,

  -- Waktu aset pertama kali dilempar ke bursa
  listed_at         TIMESTAMPTZ,

  -- Deteksi stagnansi: jika tidak ada pembeli baru dalam window waktu tertentu
  -- field ini digunakan oleh auto-split scheduler
  last_buyer_at     TIMESTAMPTZ,

  -- Jika aset hasil auto-split dari aset induk
  parent_asset_id   UUID          REFERENCES public.assets(id) ON DELETE SET NULL,

  -- Hash transaksi blockchain (TON) untuk verifikasi on-chain
  tx_hash           TEXT,

  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assets_owner_id ON public.assets (owner_id);
CREATE INDEX IF NOT EXISTS idx_assets_status   ON public.assets (status);
CREATE INDEX IF NOT EXISTS idx_assets_stage    ON public.assets (stage);

CREATE TRIGGER trg_assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =================================================================
-- TABEL: tickets
-- Tiket antrian gacha yang wajib dibeli sebelum sesi bursa dibuka.
-- Tahap 1 = 0.06 TON per tiket.
-- =================================================================
CREATE TABLE IF NOT EXISTS public.tickets (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Tahap sesi bursa yang dituju tiket ini
  stage             SMALLINT      NOT NULL DEFAULT 1
                      CHECK (stage BETWEEN 1 AND 5),

  -- Harga tiket dalam TON (Tahap 1 = 0.06 TON)
  cost_ton          NUMERIC(18,9) NOT NULL,

  -- Harga tiket dalam IDR (snapshot saat pembelian)
  cost_idr          BIGINT,

  -- Status tiket:
  --   queued  : dalam antrian, menunggu pengundian
  --   won     : menang gacha, berhak masuk sesi bursa
  --   lost    : kalah gacha
  --   expired : sesi berakhir sebelum diundi
  status            TEXT          NOT NULL DEFAULT 'queued'
                      CHECK (status IN ('queued', 'won', 'lost', 'expired')),

  -- Referensi sesi bursa terkait
  session_id        UUID,

  -- Aset yang didapat jika status = 'won'
  won_asset_id      UUID          REFERENCES public.assets(id) ON DELETE SET NULL,

  -- Hash transaksi pembayaran tiket (TON blockchain atau payment gateway)
  payment_tx_hash   TEXT,

  -- Distribusi pendapatan tiket (dicatat untuk audit):
  -- 80% -> Dana Cadangan Abadi (reserve_fund_amount_ton)
  -- 20% -> Dompet Operasional Admin (admin_cut_ton)
  reserve_fund_ton  NUMERIC(18,9) GENERATED ALWAYS AS (cost_ton * 0.8) STORED,
  admin_cut_ton     NUMERIC(18,9) GENERATED ALWAYS AS (cost_ton * 0.2) STORED,

  -- Apakah distribusi pendapatan sudah diproses
  revenue_distributed BOOLEAN     NOT NULL DEFAULT false,

  -- Nomor urut dalam antrian (untuk display di UI)
  queue_position    INTEGER,

  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tickets_user_id    ON public.tickets (user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status     ON public.tickets (status);
CREATE INDEX IF NOT EXISTS idx_tickets_session_id ON public.tickets (session_id);
CREATE INDEX IF NOT EXISTS idx_tickets_stage      ON public.tickets (stage);

CREATE TRIGGER trg_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =================================================================
-- TABEL: transactions
-- Riwayat semua transfer P2P antar-user, deposit, withdraw.
-- =================================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Jenis transaksi:
  --   p2p_transfer    : transfer aset antar user di bursa
  --   deposit_ton     : user deposit TON ke platform
  --   deposit_idr     : user deposit IDR via QRIS/Xendit
  --   withdraw_ton    : user tarik TON dari platform
  --   withdraw_idr    : user tarik IDR dari platform
  --   auto_split      : protokol darurat 50:50
  --   ticket_purchase : pembelian tiket gacha
  --   revenue_dist    : distribusi pendapatan tiket (80/20 split)
  type              TEXT          NOT NULL
                      CHECK (type IN (
                        'p2p_transfer',
                        'deposit_ton',
                        'deposit_idr',
                        'withdraw_ton',
                        'withdraw_idr',
                        'auto_split',
                        'ticket_purchase',
                        'revenue_dist'
                      )),

  -- Pihak pengirim (NULL jika deposit dari luar platform)
  from_user_id      UUID          REFERENCES public.users(id) ON DELETE SET NULL,

  -- Pihak penerima (NULL jika withdraw ke luar platform)
  to_user_id        UUID          REFERENCES public.users(id) ON DELETE SET NULL,

  -- Aset yang terlibat (untuk p2p_transfer dan auto_split)
  asset_id          UUID          REFERENCES public.assets(id) ON DELETE SET NULL,

  -- Tiket yang terlibat (untuk ticket_purchase)
  ticket_id         UUID          REFERENCES public.tickets(id) ON DELETE SET NULL,

  -- Nominal transaksi dalam TON
  amount_ton        NUMERIC(18,9),

  -- Nominal transaksi dalam IDR
  amount_idr        BIGINT,

  -- Kurs yang digunakan saat transaksi (snapshot dari tabel prices)
  rate_ton_idr      NUMERIC(18,2),

  -- Status transaksi:
  --   pending    : menunggu konfirmasi
  --   completed  : berhasil
  --   disputed   : sedang disengketakan
  --   failed     : gagal
  --   auto_split : otomatis diproses protokol darurat
  status            TEXT          NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'completed', 'disputed', 'failed', 'auto_split')),

  -- Hash transaksi di TON Blockchain (untuk verifikasi on-chain)
  tx_hash           TEXT,

  -- Referensi eksternal (Xendit payment ID untuk deposit QRIS)
  external_ref      TEXT,

  -- Metadata tambahan (JSON bebas untuk keperluan debug/audit)
  metadata          JSONB         DEFAULT '{}',

  -- Catatan dispute atau keterangan admin
  notes             TEXT,

  -- Timestamp konfirmasi transaksi di blockchain
  confirmed_at      TIMESTAMPTZ,

  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_from_user  ON public.transactions (from_user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_to_user    ON public.transactions (to_user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_asset_id   ON public.transactions (asset_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type       ON public.transactions (type);
CREATE INDEX IF NOT EXISTS idx_transactions_status     ON public.transactions (status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_tx_hash    ON public.transactions (tx_hash);

CREATE TRIGGER trg_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =================================================================
-- TABEL: reserve_fund
-- Dana Cadangan Abadi: menyimpan 80% dari setiap pendapatan tiket.
-- Digunakan untuk mencairkan 50% nilai aset saat auto-split.
-- =================================================================
CREATE TABLE IF NOT EXISTS public.reserve_fund (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Total saldo Dana Cadangan saat ini (dalam TON)
  balance_ton       NUMERIC(18,9) NOT NULL DEFAULT 0,
  -- Total akumulasi yang pernah masuk
  total_in_ton      NUMERIC(18,9) NOT NULL DEFAULT 0,
  -- Total akumulasi yang pernah keluar (untuk auto-split)
  total_out_ton     NUMERIC(18,9) NOT NULL DEFAULT 0,
  -- Referensi transaksi yang mengubah saldo
  last_tx_id        UUID          REFERENCES public.transactions(id) ON DELETE SET NULL,
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Seed: insert satu baris tunggal sebagai ledger Dana Cadangan
INSERT INTO public.reserve_fund (balance_ton, total_in_ton, total_out_ton)
VALUES (0, 0, 0)
ON CONFLICT DO NOTHING;

-- =================================================================
-- TABEL: sessions (Sesi Bursa)
-- Setiap ronde pembukaan bursa dicatat di sini.
-- =================================================================
CREATE TABLE IF NOT EXISTS public.sessions (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  stage             SMALLINT      NOT NULL CHECK (stage BETWEEN 1 AND 5),
  -- Status sesi:
  --   open       : tiket sedang dijual, antrian terbuka
  --   drawing    : pengundian gacha sedang berlangsung
  --   active     : sesi bursa aktif, transaksi P2P berjalan
  --   stagnant   : terdeteksi stagnansi (kandidat auto-split)
  --   closed     : sesi selesai
  status            TEXT          NOT NULL DEFAULT 'open'
                      CHECK (status IN ('open', 'drawing', 'active', 'stagnant', 'closed')),
  -- Total slot pembeli yang tersedia di sesi ini
  total_slots       INTEGER       NOT NULL DEFAULT 0,
  -- Slot yang sudah terisi
  filled_slots      INTEGER       NOT NULL DEFAULT 0,
  -- Waktu sesi dibuka
  opened_at         TIMESTAMPTZ   NOT NULL DEFAULT now(),
  -- Waktu sesi ditutup
  closed_at         TIMESTAMPTZ,
  -- Timestamp terakhir kali ada aktivitas transaksi
  last_activity_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_stage  ON public.sessions (stage);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions (status);

CREATE TRIGGER trg_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =================================================================
-- STORED PROCEDURE: gacha_draw (Fisher-Yates Shuffle di PostgreSQL)
-- Dijalankan langsung di database untuk mencegah serverless timeout
-- saat menangani 5.000+ user simultan.
-- =================================================================
CREATE OR REPLACE FUNCTION public.gacha_draw(p_session_id UUID)
RETURNS TABLE (
  ticket_id       UUID,
  user_id         UUID,
  is_winner       BOOLEAN,
  queue_position  INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_slots   INTEGER;
  v_filled_slots  INTEGER;
  v_ticket_ids    UUID[];
  v_shuffled_ids  UUID[];
  v_idx           INTEGER;
  v_temp          UUID;
  v_ticket        UUID;
  v_pos           INTEGER := 1;
BEGIN
  -- Ambil info sesi
  SELECT total_slots, filled_slots
  INTO   v_total_slots, v_filled_slots
  FROM   public.sessions
  WHERE  id = p_session_id AND status = 'open';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session % not found or not in open status', p_session_id;
  END IF;

  -- Kumpulkan semua tiket queued untuk sesi ini
  SELECT ARRAY_AGG(t.id ORDER BY t.created_at)
  INTO   v_ticket_ids
  FROM   public.tickets t
  WHERE  t.session_id = p_session_id
    AND  t.status = 'queued';

  IF v_ticket_ids IS NULL OR array_length(v_ticket_ids, 1) = 0 THEN
    RAISE EXCEPTION 'No queued tickets found for session %', p_session_id;
  END IF;

  -- Fisher-Yates Shuffle: acak urutan tiket secara merata
  v_shuffled_ids := v_ticket_ids;
  FOR v_idx IN REVERSE array_length(v_shuffled_ids, 1)..2 LOOP
    -- Random index antara 1 dan v_idx (inklusif)
    v_temp := v_shuffled_ids[v_idx];
    v_shuffled_ids[v_idx] := v_shuffled_ids[1 + floor(random() * v_idx)::INTEGER];
    v_shuffled_ids[1 + floor(random() * v_idx)::INTEGER] := v_temp;
  END LOOP;

  -- Update status sesi menjadi 'drawing'
  UPDATE public.sessions
  SET    status = 'drawing', updated_at = now()
  WHERE  id = p_session_id;

  -- Proses setiap tiket: pemenang = slot tersedia
  FOREACH v_ticket IN ARRAY v_shuffled_ids LOOP
    IF v_pos <= v_total_slots THEN
      -- Ini pemenang
      UPDATE public.tickets
      SET    status = 'won', queue_position = v_pos, updated_at = now()
      WHERE  id = v_ticket;

      RETURN QUERY
        SELECT t.id, t.user_id, TRUE, v_pos
        FROM public.tickets t
        WHERE t.id = v_ticket;
    ELSE
      -- Ini kalah
      UPDATE public.tickets
      SET    status = 'lost', queue_position = v_pos, updated_at = now()
      WHERE  id = v_ticket;

      RETURN QUERY
        SELECT t.id, t.user_id, FALSE, v_pos
        FROM public.tickets t
        WHERE t.id = v_ticket;
    END IF;

    v_pos := v_pos + 1;
  END LOOP;

  -- Update sesi menjadi aktif
  UPDATE public.sessions
  SET    status = 'active', filled_slots = LEAST(v_total_slots, array_length(v_shuffled_ids, 1)),
         updated_at = now()
  WHERE  id = p_session_id;

  RETURN;
END;
$$;

-- =================================================================
-- STORED PROCEDURE: process_auto_split
-- Protokol Darurat 50:50: dipanggil saat sesi stagnan.
-- 50% nilai aset -> dicairkan ke wallet user dari Dana Cadangan
-- 50% sisanya   -> dipecah jadi unit 10 TON, dilempar ke Tahap 1
-- =================================================================
CREATE OR REPLACE FUNCTION public.process_auto_split(p_asset_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_asset           RECORD;
  v_owner           RECORD;
  v_reserve         RECORD;
  v_half_ton        NUMERIC(18,9);
  v_units_count     INTEGER;
  v_new_asset_id    UUID;
  v_tx_id           UUID;
  v_result          JSONB;
  v_i               INTEGER;
BEGIN
  -- Ambil data aset
  SELECT a.*, u.id AS u_id, u.balance_idr, u.active_asset_count
  INTO   v_asset
  FROM   public.assets a
  JOIN   public.users  u ON u.id = a.owner_id
  WHERE  a.id = p_asset_id
    AND  a.status = 'listed'
    AND  a.stage > 1;  -- Protokol ini hanya berlaku untuk Tahap 2-5

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Asset % not eligible for auto-split', p_asset_id;
  END IF;

  -- Ambil saldo Dana Cadangan
  SELECT * INTO v_reserve FROM public.reserve_fund LIMIT 1;

  v_half_ton := v_asset.current_value_ton / 2;

  -- Validasi: Dana Cadangan harus cukup untuk mencairkan 50%
  IF v_reserve.balance_ton < v_half_ton THEN
    RAISE EXCEPTION 'Reserve fund insufficient: need %, have %', v_half_ton, v_reserve.balance_ton;
  END IF;

  -- Hitung berapa unit 10 TON yang dihasilkan dari 50% sisanya
  v_units_count := FLOOR(v_half_ton / 10)::INTEGER;

  -- Update aset menjadi auto_split
  UPDATE public.assets
  SET    status = 'auto_split', updated_at = now()
  WHERE  id = p_asset_id;

  -- Catat transaksi auto-split
  INSERT INTO public.transactions (type, from_user_id, to_user_id, asset_id, amount_ton, status, metadata)
  VALUES (
    'auto_split',
    NULL,
    v_asset.owner_id,
    p_asset_id,
    v_half_ton,
    'completed',
    jsonb_build_object(
      'original_value_ton', v_asset.current_value_ton,
      'cash_out_ton', v_half_ton,
      'units_generated', v_units_count
    )
  )
  RETURNING id INTO v_tx_id;

  -- Kurangi Dana Cadangan sebesar 50%
  UPDATE public.reserve_fund
  SET    balance_ton  = balance_ton  - v_half_ton,
         total_out_ton = total_out_ton + v_half_ton,
         last_tx_id  = v_tx_id,
         updated_at  = now();

  -- Tambahkan saldo pending TON ke user (menunggu konfirmasi withdrawal)
  UPDATE public.users
  SET    balance_ton_pending = balance_ton_pending + v_half_ton,
         active_asset_count  = GREATEST(0, active_asset_count - 1),
         updated_at          = now()
  WHERE  id = v_asset.owner_id;

  -- Buat unit-unit aset 10 TON baru di Tahap 1
  FOR v_i IN 1..v_units_count LOOP
    INSERT INTO public.assets (owner_id, stage, round, current_value_ton, status, parent_asset_id)
    VALUES (v_asset.owner_id, 1, 1, 10, 'listed', p_asset_id)
    RETURNING id INTO v_new_asset_id;
  END LOOP;

  -- Return ringkasan hasil
  v_result := jsonb_build_object(
    'success',         true,
    'original_asset',  p_asset_id,
    'cash_out_ton',    v_half_ton,
    'units_created',   v_units_count,
    'tx_id',           v_tx_id
  );

  RETURN v_result;
END;
$$;

-- =================================================================
-- ROW LEVEL SECURITY (RLS)
-- Aktifkan RLS di semua tabel utama
-- =================================================================

-- Users: user hanya bisa lihat & edit data dirinya sendiri
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Assets: user hanya bisa lihat aset miliknya, listing bursa bisa dilihat semua
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assets_select_own" ON public.assets
  FOR SELECT USING (
    owner_id = auth.uid()
    OR status = 'listed'    -- Aset yang terdaftar di bursa bisa dilihat semua user
  );

CREATE POLICY "assets_update_own" ON public.assets
  FOR UPDATE USING (owner_id = auth.uid());

-- Tickets: user hanya bisa lihat tiket miliknya
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tickets_select_own" ON public.tickets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "tickets_insert_own" ON public.tickets
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Transactions: user hanya bisa lihat transaksi yang melibatkan dirinya
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions_select_own" ON public.transactions
  FOR SELECT USING (
    from_user_id = auth.uid()
    OR to_user_id = auth.uid()
  );

-- Sessions: semua user bisa lihat info sesi (jadwal bursa)
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions_select_all" ON public.sessions
  FOR SELECT USING (true);

-- Reserve Fund: hanya admin yang bisa akses langsung
ALTER TABLE public.reserve_fund ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reserve_fund_admin_only" ON public.reserve_fund
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
