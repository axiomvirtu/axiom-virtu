# axiom-virtu

Next.js app for a Telegram Mini App that authenticates users via Firebase custom tokens, stores authenticated users and replay nonces in Firestore, and includes an admin-managed catalog.

## Local development

1. Copy `.env.example` to `.env.local`.
2. Fill in the required Firebase, Telegram, and secret values.
3. Run the app locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

This repo uses Firebase Auth, Firebase Admin SDK, TONConnect, and Telegram initData validation to secure login and admin workflows.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
### Langkah cepat deploy

1. Buat akun di https://vercel.com dan login.
2. Klik **New Project** dan pilih repository GitHub yang berisi project ini atau gunakan **Import**.
3. Pastikan framework terdeteksi sebagai **Next.js**.
4. Tambahkan environment variables di Vercel Dashboard (lihat `.env.example`).
5. Klik **Deploy**.

### Environment variables yang dibutuhkan

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `FIREBASE_SERVICE_ACCOUNT_KEY`
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

## Firebase integration

See `RELEASE.md` for the final production release checklist and deployment steps.


#### Nonce (replay) TTL

The authentication flow stores a hashed nonce of Telegram `initData` in Firestore at collection `telegram_init_nonces` to protect against replay attacks. The server sets an `expiresAt` timestamp on each nonce document.

If you can enable Firestore TTL, set the policy to use `expiresAt` for collection `telegram_init_nonces`.

If your project cannot enable billing, use manual cleanup instead:

- Call `POST /api/nonce-cleanup` with header `Authorization: Bearer $ADMIN_SECRET`.
- Or run `npm run cleanup-nonces` locally with `FIREBASE_SERVICE_ACCOUNT_KEY` available.

Environment variable: `INIT_NONCE_TTL_MS` (milliseconds, default `300000` = 5 minutes).

- `app/api/auth/telegram/route.ts` memvalidasi `initData` Telegram dan menghasilkan token custom Firebase.
- `app/auth/page.tsx` melakukan login dengan `signInWithCustomToken`.
- `app/providers.tsx` menjaga auth state Firebase di seluruh aplikasi.
- `app/page.tsx` dan `app/admin/catalog/page.tsx` membaca/menulis data Firestore.

### Catatan

- Pastikan `FIREBASE_SERVICE_ACCOUNT_KEY` berisi JSON service account yang valid.
- Atur aturan keamanan Firestore di Firebase Console, atau gunakan `firestore.rules` sebagai contoh.
- Untuk admin access, gunakan custom claim `admin` atau field `is_admin` pada dokumen `users/{uid}`.

### Production checklist

Sebelum deploy ke production, jalankan `npm run check-env` di environment lokal dengan semua environment variables yang diperlukan terpasang. Pastikan:

- `firestore.rules` sudah ada di repo dan di-upload secara manual ke Firebase Console.
- Firestore TTL diaktifkan untuk field `expiresAt` pada koleksi `telegram_init_nonces`.
- `ADMIN_SECRET` dan `FIREBASE_SERVICE_ACCOUNT_KEY` tidak pernah dibagikan ke client.
- Endpoint `GET /api/health` dapat diakses oleh monitoring.
- Ujicoba lengkap dilakukan pada Telegram Mini App asli.

### Admin management

Untuk memberikan atau mencabut hak `admin` pada user Firebase, ada dua opsi:

- CLI (lokal / scripting): jalankan `FIREBASE_SERVICE_ACCOUNT_KEY` di environment lalu:

```bash
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}' npm run set-admin -- <uid> true
```

- Endpoint server (deploy): ada route `POST /api/admin/set-admin` yang menerima JSON `{ "uid": "<uid>", "admin": true }` dan harus dilindungi menggunakan header `Authorization: Bearer <ADMIN_SECRET>`. Set `ADMIN_SECRET` di environment pada deployment.

Contoh curl ke endpoint (server terdeploy):

```bash
curl -X POST https://your-domain/api/admin/set-admin \
  -H "Authorization: Bearer $ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"uid":"USER_UID","admin":true}'
```

Gunakan salah satu metode di atas untuk mengelola admin role secara aman.

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

### Backup & restore Firestore

Contoh export Firestore ke Google Cloud Storage (menggunakan `gcloud`):

```bash
# pastikan project yang aktif adalah project Firebase Anda
gcloud firestore export gs://my-bucket/firestore-backups --project=my-firebase-project
```

Untuk restore (import):

```bash
gcloud firestore import gs://my-bucket/firestore-backups/2026-01-01T00:00:00_
```

Atur lifecycle bucket dan akses IAM agar backup terenkripsi dan aman.
- Contoh endpoint global:
  - `GET https://<your-domain>/api/prices/update?currency=usd`
  - `GET https://<your-domain>/api/prices/update?asset=bitcoin&currency=usd`
- Jalankan cron job setiap 1 menit atau sesuai kebutuhan.

> Pastikan environment variable yang diperlukan tersedia pada runtime saat menjalankan server Next.js.

### Deploy via Vercel CLI

Jika ingin deploy lewat terminal:

```bash
npm install -g vercel
vercel login
vercel --prod
```
Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
