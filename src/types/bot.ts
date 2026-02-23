/**
 * Bot Dashboard TypeScript Types
 * Mapping với bot-core-service API response format
 */

// ─── Auth
export interface BotAuthResponse {
  accessToken: string;
  refreshToken: string;
  username: string;
  user: BotUserInfo;
}

// Bot auth response — responseData khi login thành công
// (VPS backend trả thêm refreshToken qua code local chưa deploy — field này có sau khi deploy)
export interface BotUserInfo {
  id: number;
  name: string;
  email: string;
  is_superuser: boolean;
  avatarFilePath: string | null;
}

// ─── Users
// VPS UserPublic schema (openapi.json): id, email, is_active, is_superuser, full_name
// username field KHÔNG có trong VPS backend schema hiện tại
export interface UserPublic {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_superuser: boolean;
}

export interface UsersPublic {
  data: UserPublic[];
  count: number;
}

// VPS UserCreate schema: email, password, is_active, is_superuser, full_name
// (không có username field trong VPS hiện tại)
export interface UserCreate {
  email: string;
  password: string;
  full_name?: string;
  is_active?: boolean;
  is_superuser?: boolean;
}

export interface UserUpdate {
  email?: string;
  full_name?: string;
  is_active?: boolean;
}

// ─── User Summary
export interface UserSummary {
  user_id: number;
  account_count: number;
  total_equity: number;
  total_initial_balance: number;
  total_realized_pnl: number;
  total_fee: number;
  total_pnl_net: number;
  total_margin_used: number;
}

// ─── Account Config
export interface AccountConfig {
  id: number;
  name: string;
  description: string | null;
  user_id: number | null;
  trade_amount_usdt: number;
  leverage: number;
  max_open_signals: number;
  max_open_positions: number;
  oc_ratio: number | null;
  oc_multiplier_override: number | null;
  enabled: boolean;
}

export interface AccountCreate {
  name: string;
  user_id?: number;
  description?: string;
  trade_amount_usdt?: number;
  leverage?: number;
  max_open_signals?: number;
  max_open_positions?: number;
  oc_ratio?: number | null;
}

export interface AccountUpdate {
  name?: string;
  description?: string;
  trade_amount_usdt?: number;
  leverage?: number;
  max_open_signals?: number;
  max_open_positions?: number;
  oc_ratio?: number | null;
  oc_multiplier_override?: number | null;
  enabled?: boolean;
}

// ─── Account Balance
export interface AccountBalance {
  id: number;
  balance_type: 'SPOT' | 'FUTURES';
  initial_balance: number;
  equity: number;
  margin_used: number;
  realized_pnl: number;
  unrealized_pnl: number;
  fee_total: number;
  pnl_net: number;
  available_equity: number;
}

// ─── Signal
export interface Signal {
  id: number;
  account_id: number;
  symbol: string;
  time_frame: string;
  side: 'BUY' | 'SELL';
  entry_price: number;
  sl: number;
  tp: number;
  oc_percent: number | null;
  oc_multiplier: number | null;
  status: 'ACTIVE' | 'CLOSED' | 'CANCELED' | string;
  closed_reason: string | null;
  timestamp: string | null;
}

// ─── Order
export interface Order {
  id: number;
  signal_id: number | null;
  symbol: string;
  side: 'BUY' | 'SELL';
  order_type: string;
  price: number | null;
  stop_price: number | null;
  quantity: number;
  status: 'NEW' | 'FILLED' | 'CANCELED' | string;
  filled_price: number | null;
  fee_usdt: number | null;
  timestamp: string | null;
}

// ─── Position
export interface Position {
  id: number;
  account_id: number;
  symbol: string;
  time_frame: string;
  side: 'LONG' | 'SHORT';
  entry_price: number;
  exit_price: number | null;
  sl_price: number | null;
  tp_price: number | null;
  pnl_usd: number | null;
  pnl_percent: number | null;
  close_type: string | null;
  status: 'OPEN' | 'CLOSED';
  opened_at: string | null;
  closed_at: string | null;
  oc_percent: number | null;
  decay_count: number | null;
}

// ─── Strategy
export interface StrategyStatus {
  enabled: boolean;
  config: Record<string, unknown>;
  rolling_oc: unknown;
  adaptive_oc: unknown;
  candle_states: unknown;
  kline_collectors: unknown;
  matching_engine: unknown;
  timestamp: string;
}

export interface StrategyConfig {
  config: Record<string, string>;
}

export interface OcState {
  adaptive_multipliers: unknown;
  rolling_oc: unknown;
}

// ─── API Response container
export interface BotApiListResponse<T> {
  count: number;
  [key: string]: T[] | number;
}
