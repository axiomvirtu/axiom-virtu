/**
 * lib/supabase/types.ts
 * 
 * TypeScript types yang di-generate dari skema database.
 * Di produksi, generate otomatis dengan: npx supabase gen types typescript
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ─── ENUM helpers ───────────────────────────────────────────────
export type UserStatus     = 'active' | 'suspended' | 'banned'
export type UserRole       = 'user' | 'admin'
export type AssetStatus    = 'listed' | 'sold' | 'holding' | 'auto_split' | 'cancelled'
export type TicketStatus   = 'queued' | 'won' | 'lost' | 'expired'
export type TxType         = 
  | 'p2p_transfer'
  | 'deposit_ton'
  | 'deposit_idr'
  | 'withdraw_ton'
  | 'withdraw_idr'
  | 'auto_split'
  | 'ticket_purchase'
  | 'revenue_dist'
export type TxStatus       = 'pending' | 'completed' | 'disputed' | 'failed' | 'auto_split'
export type SessionStatus  = 'open' | 'drawing' | 'active' | 'stagnant' | 'closed'

// ─── Row types ───────────────────────────────────────────────────
export interface UserRow {
  id:                   string
  telegram_id:          number
  username:             string | null
  first_name:           string | null
  last_name:            string | null
  avatar_url:           string | null
  wallet_address:       string | null
  bank_account:         string | null
  bank_name:            string | null
  device_fingerprint:   string | null
  balance_idr:          number
  balance_ton_pending:  string   // NUMERIC comes as string from Postgres
  active_asset_count:   number
  status:               UserStatus
  role:                 UserRole
  referral_code:        string | null
  referred_by:          string | null
  created_at:           string
  updated_at:           string
}

export interface AssetRow {
  id:                 string
  owner_id:           string
  stage:              number
  round:              number
  current_value_ton:  string
  current_value_idr:  number | null
  status:             AssetStatus
  ticket_id:          string | null
  listed_at:          string | null
  last_buyer_at:      string | null
  parent_asset_id:    string | null
  tx_hash:            string | null
  created_at:         string
  updated_at:         string
}

export interface TicketRow {
  id:                   string
  user_id:              string
  stage:                number
  cost_ton:             string
  cost_idr:             number | null
  status:               TicketStatus
  session_id:           string | null
  won_asset_id:         string | null
  payment_tx_hash:      string | null
  reserve_fund_ton:     string   // Generated column
  admin_cut_ton:        string   // Generated column
  revenue_distributed:  boolean
  queue_position:       number | null
  created_at:           string
  updated_at:           string
}

export interface PriceRow {
  id:             string
  asset_id:       string
  currency:       string
  ton_market:     string | null
  ton_buy:        string | null
  ton_sell:       string | null
  spread_amount:  string | null
  ton_idr_market: string | null
  ton_idr_buy:    string | null
  ton_idr_sell:   string | null
  source:         string
  fetched_at:     string
  locked_until:   string   // Generated column
}

export interface TransactionRow {
  id:           string
  type:         TxType
  from_user_id: string | null
  to_user_id:   string | null
  asset_id:     string | null
  ticket_id:    string | null
  amount_ton:   string | null
  amount_idr:   number | null
  rate_ton_idr: string | null
  status:       TxStatus
  tx_hash:      string | null
  external_ref: string | null
  metadata:     Json
  notes:        string | null
  confirmed_at: string | null
  created_at:   string
  updated_at:   string
}

export interface SessionRow {
  id:               string
  stage:            number
  status:           SessionStatus
  total_slots:      number
  filled_slots:     number
  opened_at:        string
  closed_at:        string | null
  last_activity_at: string
  created_at:       string
  updated_at:       string
}

export interface ReserveFundRow {
  id:            string
  balance_ton:   string
  total_in_ton:  string
  total_out_ton: string
  last_tx_id:    string | null
  updated_at:    string
}

export interface AssetCatalogRow {
  id:                 string
  name:               string
  image_url:          string
  level_name:         string
  capital_min:        number
  capital_max:        number
  ticket_time_start:  string
  ticket_time_end:    string
  trading_time_start: string
  trading_time_end:   string
  order_index:        number
  is_active:          boolean
  created_at:         string
  updated_at:         string
}

// ─── Database interface (untuk createClient typing) ──────────────
export interface Database {
  public: {
    Tables: {
      users: {
        Row:    UserRow
        Insert: Omit<UserRow, 'id' | 'created_at' | 'updated_at' | 'referral_code' | 'active_asset_count' | 'balance_idr' | 'balance_ton_pending'>
        Update: Partial<Omit<UserRow, 'id' | 'created_at'>>
      }
      assets: {
        Row:    AssetRow
        Insert: Omit<AssetRow, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<AssetRow, 'id' | 'created_at'>>
      }
      tickets: {
        Row:    TicketRow
        Insert: Omit<TicketRow, 'id' | 'created_at' | 'updated_at' | 'reserve_fund_ton' | 'admin_cut_ton'>
        Update: Partial<Omit<TicketRow, 'id' | 'created_at' | 'reserve_fund_ton' | 'admin_cut_ton'>>
      }
      prices: {
        Row:    PriceRow
        Insert: Omit<PriceRow, 'id' | 'locked_until'>
        Update: Partial<Omit<PriceRow, 'id' | 'locked_until'>>
      }
      transactions: {
        Row:    TransactionRow
        Insert: Omit<TransactionRow, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<TransactionRow, 'id' | 'created_at'>>
      }
      sessions: {
        Row:    SessionRow
        Insert: Omit<SessionRow, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<SessionRow, 'id' | 'created_at'>>
      }
      reserve_fund: {
        Row:    ReserveFundRow
        Insert: Omit<ReserveFundRow, 'id' | 'updated_at'>
        Update: Partial<Omit<ReserveFundRow, 'id'>>
      }
      asset_catalogs: {
        Row:    AssetCatalogRow
        Insert: Omit<AssetCatalogRow, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<AssetCatalogRow, 'id' | 'created_at'>>
      }
    }
    Functions: {
      gacha_draw: {
        Args:    { p_session_id: string }
        Returns: Array<{
          ticket_id:      string
          user_id:        string
          is_winner:      boolean
          queue_position: number
        }>
      }
      process_auto_split: {
        Args:    { p_asset_id: string }
        Returns: Json
      }
    }
  }
}
