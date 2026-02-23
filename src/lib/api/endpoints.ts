/**
 * API Endpoints — Bot Dashboard
 * Mapped trực tiếp với bot-core-service API (prefix: /api/v1)
 */

export const API_ENDPOINTS = {
  // ─── Auth
  AUTH_LOGIN: `/auth/login`,
  AUTH_REFRESH_TOKEN: `/auth/refresh_token`,
  AUTH_LOGOUT: `/auth/logout`,

  // ─── Users
  USERS_LIST: `/users/`,
  USERS_ME: `/users/me`,
  USERS_GET: (id: number) => `/users/${id}`,
  USERS_CREATE: `/users/`,
  USERS_UPDATE: (id: number) => `/users/${id}`,
  USERS_DELETE: (id: number) => `/users/${id}`,

  // ─── User Summary (Equity + PnL)
  USER_SUMMARY: (userId: number) => `/users/${userId}/summary`,

  // ─── Accounts
  ACCOUNTS_LIST: `/accounts/`,
  ACCOUNTS_GET: (id: number) => `/accounts/${id}`,
  ACCOUNTS_CREATE: `/accounts/`,
  ACCOUNTS_UPDATE: (id: number) => `/accounts/${id}`,

  // ─── Balances
  BALANCES_GET: (accountId: number) => `/accounts/${accountId}/balances`,
  BALANCES_SEED: (accountId: number) => `/accounts/${accountId}/balances`,

  // ─── Strategy
  STRATEGY_STATUS: `/strategy/status`,
  STRATEGY_CONFIG: `/strategy/config`,
  STRATEGY_TOGGLE: `/strategy/toggle`,
  STRATEGY_OC_STATE: `/strategy/oc-state`,
  STRATEGY_DECAY_STATUS: `/strategy/decay/status`,
  STRATEGY_SYMBOLS: `/strategy/symbols`,
  STRATEGY_SYMBOLS_REFRESH: `/strategy/symbols/refresh`,

  // ─── Trading Data
  STRATEGY_SIGNALS: `/strategy/signals`,
  STRATEGY_ORDERS: `/strategy/orders`,
  STRATEGY_POSITIONS: `/strategy/positions`,
  STRATEGY_POSITIONS_SUMMARY: `/strategy/positions/summary`,
  STRATEGY_POSITIONS_ACCOUNT: (accountId: number) => `/strategy/positions/account/${accountId}`,

  // ─── System
  BG_TASKS_STATUS: `/background-tasks/status`,
} as const;
