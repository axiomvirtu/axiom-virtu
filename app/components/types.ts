export type AssetCatalogRow = {
  id: string
  name: string
  image_url: string
  level_name: string
  capital_min: number
  capital_max: number
  ticket_time_start: string
  ticket_time_end: string
  trading_time_start: string
  trading_time_end: string
  order_index: number
  is_active: boolean
  contract_asset: string
  profit: string
  is_multi: boolean
  created_at: string
  updated_at: string
}

export interface DbUser {
  id: string
  telegram_id: string
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
  wallet_address?: string | null
}
