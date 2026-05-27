/**
 * lib/telegram/types.ts
 *
 * TypeScript types untuk Telegram Web App SDK.
 * Referensi: https://core.telegram.org/bots/webapps
 */

// ─── User info dari Telegram ─────────────────────────────────────
export interface TelegramUser {
  id:            number
  is_bot?:       boolean
  first_name:    string
  last_name?:    string
  username?:     string
  language_code?: string
  is_premium?:   boolean
  photo_url?:    string
}

// ─── Init Data (dikirim Telegram ke Mini App) ────────────────────
export interface TelegramInitData {
  query_id?:         string
  user?:             TelegramUser
  receiver?:         TelegramUser
  chat_type?:        'sender' | 'private' | 'group' | 'supergroup' | 'channel'
  chat_instance?:    string
  start_param?:      string
  can_send_after?:   number
  auth_date:         number
  hash:              string
}

// ─── Theme Parameters ─────────────────────────────────────────────
export interface TelegramThemeParams {
  bg_color?:                  string
  text_color?:                string
  hint_color?:                string
  link_color?:                string
  button_color?:              string
  button_text_color?:         string
  secondary_bg_color?:        string
  header_bg_color?:           string
  bottom_bar_bg_color?:       string
  accent_text_color?:         string
  section_bg_color?:          string
  section_header_text_color?: string
  subtitle_text_color?:       string
  destructive_text_color?:    string
}

// ─── Main Button ──────────────────────────────────────────────────
export interface TelegramMainButton {
  text:              string
  color:             string
  textColor:         string
  isVisible:         boolean
  isActive:          boolean
  isProgressVisible: boolean
  setText(text: string): TelegramMainButton
  onClick(callback: () => void): TelegramMainButton
  offClick(callback: () => void): TelegramMainButton
  show(): TelegramMainButton
  hide(): TelegramMainButton
  enable(): TelegramMainButton
  disable(): TelegramMainButton
  showProgress(leaveActive?: boolean): TelegramMainButton
  hideProgress(): TelegramMainButton
  setParams(params: {
    text?:       string
    color?:      string
    text_color?: string
    is_active?:  boolean
    is_visible?: boolean
  }): TelegramMainButton
}

// ─── Back Button ──────────────────────────────────────────────────
export interface TelegramBackButton {
  isVisible: boolean
  onClick(callback: () => void): TelegramBackButton
  offClick(callback: () => void): TelegramBackButton
  show(): TelegramBackButton
  hide(): TelegramBackButton
}

// ─── Haptic Feedback ──────────────────────────────────────────────
export interface TelegramHapticFeedback {
  impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): TelegramHapticFeedback
  notificationOccurred(type: 'error' | 'success' | 'warning'): TelegramHapticFeedback
  selectionChanged(): TelegramHapticFeedback
}

// ─── WebApp Interface ─────────────────────────────────────────────
export interface TelegramWebApp {
  initData:           string
  initDataUnsafe:     TelegramInitData
  version:            string
  platform:           string
  colorScheme:        'light' | 'dark'
  themeParams:        TelegramThemeParams
  isExpanded:         boolean
  viewportHeight:     number
  viewportStableHeight: number
  headerColor:        string
  backgroundColor:    string
  isClosingConfirmationEnabled: boolean

  // Methods
  ready():                             void
  expand():                            void
  close():                             void
  enableClosingConfirmation():         void
  disableClosingConfirmation():        void
  setHeaderColor(color: string):       void
  setBackgroundColor(color: string):   void
  sendData(data: string):              void
  openLink(url: string, options?: { try_instant_view?: boolean }): void
  openTelegramLink(url: string):       void
  openInvoice(url: string, callback?: (status: string) => void): void
  showPopup(params: {
    title?:   string
    message:  string
    buttons?: Array<{
      id?:    string
      type?:  'default' | 'ok' | 'close' | 'cancel' | 'destructive'
      text?:  string
    }>
  }, callback?: (buttonId: string) => void): void
  showAlert(message: string, callback?: () => void):     void
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void
  showScanQrPopup(params: { text?: string }, callback?: (data: string) => boolean): void
  closeScanQrPopup(): void
  readTextFromClipboard(callback?: (text: string) => void): void
  requestWriteAccess(callback?: (granted: boolean) => void): void
  requestContact(callback?: (granted: boolean) => void): void

  // Event handlers
  onEvent(eventType: string, callback: () => void): void
  offEvent(eventType: string, callback: () => void): void

  // Sub-objects
  MainButton:     TelegramMainButton
  BackButton:     TelegramBackButton
  HapticFeedback: TelegramHapticFeedback
}

// ─── Global Window augmentation ──────────────────────────────────
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}
