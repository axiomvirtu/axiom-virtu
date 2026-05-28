/**
 * lib/constants.ts
 *
 * Konstanta bisnis sentral untuk seluruh aplikasi.
 * Ubah di sini jika ada perubahan aturan bisnis.
 */

// ─── Asset Stages ─────────────────────────────────────────────────
/** Harga awal aset (Tahap 1) dalam TON */
export const ASSET_BASE_PRICE_TON = 10

/** Jumlah tahap pertumbuhan aset */
export const ASSET_TOTAL_STAGES = 5

/** Persentase pertumbuhan compounding per putaran */
export const ASSET_GROWTH_RATE = 0.10  // 10%

/** Harga aset per tahap (compounding +10% dari tahap sebelumnya) */
export const ASSET_PRICE_PER_STAGE: Record<number, number> = {
  1: 10.000,   // 10 TON
  2: 11.000,   // 10 × 1.10
  3: 12.100,   // 11 × 1.10
  4: 13.310,   // 12.1 × 1.10
  5: 14.641,   // 13.31 × 1.10
}

/**
 * Hitung nilai aset berdasarkan tahap dan putaran.
 * Formula: base × (1 + rate)^(stage - 1) × (1 + rate)^(round - 1)
 */
export function calcAssetValue(stage: number, round: number = 1): number {
  const base = ASSET_BASE_PRICE_TON
  const totalPower = (stage - 1) + (round - 1)
  return parseFloat((base * Math.pow(1 + ASSET_GROWTH_RATE, totalPower)).toFixed(9))
}

// ─── Ticket Pricing ───────────────────────────────────────────────
/** Harga tiket gacha per tahap dalam TON */
export const TICKET_PRICE_PER_STAGE: Record<number, number> = {
  1: 0.06,
  2: 0.066,   // +10% dari Tahap 1
  3: 0.0726,
  4: 0.07986,
  5: 0.087846,
}

/** Porsi Dana Cadangan dari pendapatan tiket (80%) */
export const TICKET_RESERVE_SHARE = 0.80

/** Porsi Admin dari pendapatan tiket (20%) */
export const TICKET_ADMIN_SHARE = 0.20

// ─── Money Changer ────────────────────────────────────────────────
/** Spread flat dalam IDR per 1 TON */
export const MC_SPREAD_IDR = Number(process.env.NEXT_PUBLIC_MC_SPREAD_IDR ?? 2000)

/** Durasi Price Lock dalam milidetik (60 detik) */
export const PRICE_LOCK_MS = Number(process.env.NEXT_PUBLIC_PRICE_LOCK_MS ?? 60_000)

// ─── Account Limits ───────────────────────────────────────────────
/** Maksimal aset aktif per akun */
export const MAX_ACTIVE_ASSETS = Number(process.env.NEXT_PUBLIC_MAX_ACTIVE_ASSETS ?? 5)

/** Minimal aset aktif (sebelum error anti-farming) */
export const MIN_ACTIVE_ASSETS = 1

// ─── Auto-Split ───────────────────────────────────────────────────
/** Rasio split: 50% tunai, 50% unit baru */
export const AUTO_SPLIT_RATIO = 0.50

/** Nilai per unit baru hasil auto-split (selalu 10 TON / Tahap 1) */
export const AUTO_SPLIT_UNIT_VALUE = 10

/**
 * Hitung jumlah unit Tahap 1 yang dihasilkan dari 50% sisa nilai aset.
 */
export function calcAutoSplitUnits(assetValueTon: number): number {
  const halfValue = assetValueTon * AUTO_SPLIT_RATIO
  return Math.floor(halfValue / AUTO_SPLIT_UNIT_VALUE)
}

// ─── Stagnancy Detection ──────────────────────────────────────────
/** Durasi tidak ada aktivitas (dalam milidetik) sebelum sesi dianggap stagnan */
export const STAGNANCY_THRESHOLD_MS = 24 * 60 * 60 * 1000  // 24 jam

// ─── TON Blockchain ───────────────────────────────────────────────
/** Decimal presisi TON (9 angka di belakang koma) */
export const TON_DECIMALS = 9

/**
 * Format nilai TON dengan presisi yang tepat.
 */
export function formatTon(value: number | string, decimals = 4): string {
  return Number(value).toFixed(decimals) + ' TON'
}

/**
 * Format nilai fiat berdasarkan kode mata uang.
 */
export function formatCurrency(value: number, currency = 'IDR', locale?: string): string {
  return new Intl.NumberFormat(locale ?? 'en-US', {
    style:    'currency',
    currency,
    maximumFractionDigits: currency === 'IDR' ? 0 : 2,
  }).format(value)
}

/**
 * Format nilai IDR sebagai Rupiah.
 */
export function formatIDR(value: number): string {
  return formatCurrency(value, 'IDR', 'id-ID')
}
