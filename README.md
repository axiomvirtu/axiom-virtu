This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
### Langkah cepat deploy

1. Buat akun di https://vercel.com dan login.
2. Klik **New Project** dan pilih repository GitHub yang berisi project ini atau gunakan **Import**.
3. Pastikan framework terdeteksi sebagai **Next.js**.
4. Tambahkan environment variables di Vercel Dashboard (lihat `.env.example`).
5. Klik **Deploy**.

### Environment variables yang dibutuhkan

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TELEGRAM_BOT_TOKEN`
- `CRON_SECRET`
- `COINGECKO_API_KEY` (opsional jika ingin price update)
- `COINGECKO_ASSET_ID` (opsional, default `the-open-network`)
- `COINGECKO_CURRENCY` (opsional, default `idr`)
- `MC_SPREAD` (opsional, default `2000`)
- `NEXT_PUBLIC_MC_SPREAD_IDR` (opsional, default `2000`)
- `NEXT_PUBLIC_PRICE_LOCK_MS` (opsional, default `60000`)
- `NEXT_PUBLIC_MAX_ACTIVE_ASSETS` (opsional, default `5`)

> Untuk development lokal, copy `.env.example` menjadi `.env.local` dan isi nilai yang sesuai.

## Setup Database

1. Buka Supabase Project kamu.
2. Pilih menu `SQL editor`.
3. Paste seluruh isi `supabase/schema.sql` dan jalankan.
4. Verifikasi tabel penting telah dibuat:
   - `public.users`
   - `public.prices`
   - `public.assets`
   - `public.tickets`
   - `public.transactions`
   - `public.reserve_fund`
   - `public.sessions`
5. Jika ingin menambahkan sample data harga awal, jalankan `supabase/seed.sql`.

### Cron / price update

- Endpoint cron: `GET https://<your-domain>/api/prices/update`
- Header yang dibutuhkan:
  - `Authorization: Bearer <CRON_SECRET>`
- Contoh jika `CRON_SECRET=axiom-virtu-040698`:
  - `Authorization: Bearer axiom-virtu-040698`
- Query params opsional untuk dukung internasionalisasi:
  - `asset` = CoinGecko asset id (default `the-open-network`)
  - `currency` = fiat currency (default `idr`)
  - `spread` = spread amount dalam mata uang yang dipilih (default `MC_SPREAD`)
- Contoh endpoint global:
  - `GET https://<your-domain>/api/prices/update?currency=usd`
  - `GET https://<your-domain>/api/prices/update?asset=bitcoin&currency=usd`
- Jalankan cron job setiap 1 menit atau sesuai kebutuhan.

> Pastikan `SUPABASE_SERVICE_ROLE_KEY` tersedia pada runtime saat menjalankan server Next.js sehingga endpoint harga dapat menulis ke Supabase.

### Deploy via Vercel CLI

Jika ingin deploy lewat terminal:

```bash
npm install -g vercel
vercel login
vercel --prod
```
Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
