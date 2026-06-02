# Release Checklist

Dokumen ini berisi langkah-langkah final untuk mempersiapkan `axiom-virtu` ke staging atau production.

## 1. Upload Firestore rules

1. Buka Firebase Console > Firestore Database > Rules.
2. Paste isi `firestore.rules` dari repo.
3. Simpan.
4. Jika ada koleksi baru di masa depan, tambahkan aturan baru sebelum deploy.

## 2. Set environment variables

Pasang env vars di platform hosting atau pada environment deploy:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `FIREBASE_SERVICE_ACCOUNT_KEY`
- `ADMIN_SECRET`
- `TELEGRAM_BOT_TOKEN`
- `CRON_SECRET`

Opsional jika digunakan:
- `COINGECKO_API_KEY`
- `COINGECKO_ASSET_ID`
- `COINGECKO_CURRENCY`
- `MC_SPREAD`
- `NEXT_PUBLIC_MC_SPREAD_IDR`
- `NEXT_PUBLIC_PRICE_LOCK_MS`
- `NEXT_PUBLIC_MAX_ACTIVE_ASSETS`
- `INIT_NONCE_TTL_MS`

Jangan commit `FIREBASE_SERVICE_ACCOUNT_KEY` atau `ADMIN_SECRET` di repo.

## 3. Validasi environment

Jalankan di lingkungan staging atau lokal dengan env vars yang terpasang:

```bash
npm run check-env
npm run build
```

Jika ada error missing env, perbaiki sebelum deploy.

## 4. Firestore TTL / cleanup

Jika billing aktif dan kamu ingin gunakan TTL:
- aktifkan TTL di Google Cloud Console dengan collection `telegram_init_nonces` dan field `expiresAt`.

Jika billing belum aktif:
- tidak ada TTL otomatis.
- kamu bisa pakai cleanup manual dengan `POST /api/nonce-cleanup` atau `npm run cleanup-nonces`.

## 5. Deploy dan uji Telegram Mini App

1. Deploy ke staging atau production.
2. Buka Mini App dari bot Telegram.
3. Periksa:
   - `app/api/auth/telegram` menerima `initData`
   - login berhasil
   - redirect ke dashboard
   - `Connect TON` bekerja
   - admin page `/admin/catalog` hanya dapat diakses oleh admin
4. Jika ada masalah, cek log server dan Telegram bot settings.

## 6. Monitoring dan health check

- Gunakan `GET /api/health` untuk pengecekan service.
- Pastikan endpoint ini bisa diakses dari monitoring eksternal.
- Jika kamu pakai uptime monitoring, arahkan ke URL tersebut.

## 7. Backup Firestore

Rekomendasi:
- aktifkan export Firestore terjadwal ke GCS, atau
- lakukan export manual secara berkala.

Contoh export:
```bash
gcloud firestore export gs://my-bucket/firestore-backups --project=my-firebase-project
```

## 8. Setelah launch

- Periksa trafik dan kesalahan di log.
- Ulangi `npm run cleanup-nonces` secara berkala jika tidak menggunakan TTL.
- Update `firestore.rules` jika ada koleksi atau permission baru.
