/**
 * Bot Service — API calls cho bot-dashboard
 * Sử dụng axios client đã có interceptors (auto attach token, auto refresh)
 */

import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';
import type {
  UserPublic,
  UsersPublic,
  UserCreate,
  UserUpdate,
  UserSummary,
  Account,
  AccountCreate,
  AccountUpdate,
  AccountBalance,
  Signal,
  Order,
  Position,
  StrategyStatus,
  StrategyConfig,
  OcState,
} from '@/types/bot';

// ─── USERS ───────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<UsersPublic> {
  const res = await apiClient.get<UsersPublic>(API_ENDPOINTS.USERS_LIST);
  return res.data;
}

export async function getUserById(id: number): Promise<UserPublic> {
  const res = await apiClient.get<UserPublic>(API_ENDPOINTS.USERS_GET(id));
  return res.data;
}

export async function createUser(data: UserCreate): Promise<UserPublic> {
  const res = await apiClient.post<UserPublic>(API_ENDPOINTS.USERS_CREATE, data);
  return res.data;
}

export async function updateUser(id: number, data: UserUpdate): Promise<UserPublic> {
  const res = await apiClient.put<UserPublic>(API_ENDPOINTS.USERS_UPDATE(id), data);
  return res.data;
}

export async function deleteUser(id: number): Promise<{ message: string }> {
  const res = await apiClient.delete<{ message: string }>(API_ENDPOINTS.USERS_DELETE(id));
  return res.data;
}

export async function getUserSummary(userId: number): Promise<UserSummary> {
  const res = await apiClient.get<UserSummary>(API_ENDPOINTS.USER_SUMMARY(userId));
  return res.data;
}

export async function getCurrentUser(): Promise<UserPublic> {
  const res = await apiClient.get<UserPublic>(API_ENDPOINTS.USERS_ME);
  return res.data;
}

// ─── ACCOUNTS ────────────────────────────────────────────────────────────────

export async function getAccounts(): Promise<{ count: number; accounts: Account[] }> {
  const res = await apiClient.get<{ count: number; accounts: Account[] }>(API_ENDPOINTS.ACCOUNTS_LIST);
  return res.data;
}

export async function getAccountById(id: number): Promise<Account> {
  const res = await apiClient.get<Account>(API_ENDPOINTS.ACCOUNTS_GET(id));
  return res.data;
}

export async function createAccount(data: AccountCreate): Promise<{ id: number; name: string; configs_saved: number; message: string }> {
  const res = await apiClient.post(API_ENDPOINTS.ACCOUNTS_CREATE, data);
  return res.data;
}

export async function updateAccount(id: number, data: AccountUpdate): Promise<{ id: number; name: string; message: string }> {
  const res = await apiClient.put(API_ENDPOINTS.ACCOUNTS_UPDATE(id), data);
  return res.data;
}

// ─── BALANCES ────────────────────────────────────────────────────────────────

export async function getAccountBalances(accountId: number): Promise<{ account_id: number; balances: AccountBalance[] }> {
  const res = await apiClient.get(API_ENDPOINTS.BALANCES_GET(accountId));
  return res.data;
}

export async function seedBalance(accountId: number, data: { balance_type: 'SPOT' | 'FUTURES'; initial_balance: number }) {
  const res = await apiClient.post(API_ENDPOINTS.BALANCES_SEED(accountId), data);
  return res.data;
}

export async function transferBalance(
  accountId: number,
  data: { from_type: 'SPOT' | 'FUTURES'; to_type: 'SPOT' | 'FUTURES'; amount: number }
): Promise<{
  account_id: number;
  from_type: string;
  to_type: string;
  amount: number;
  source_equity_after: number;
  target_equity_after: number;
  message: string;
}> {
  const res = await apiClient.post(`/accounts/${accountId}/balances/transfer`, data);
  return res.data;
}

export async function checkAccountReadiness(accountId: number): Promise<{ ready: boolean; checks: Record<string, boolean>; warnings: string[] }> {
  const res = await apiClient.get(`/accounts/${accountId}/readiness`);
  return res.data;
}

export async function getAccountConfig(accountId: number): Promise<{ account_id: number; effective_config: Record<string, unknown>; overrides: Record<string, string> }> {
  const res = await apiClient.get(API_ENDPOINTS.ACCOUNTS_CONFIG(accountId));
  return res.data;
}

export async function upsertAccountConfig(accountId: number, paramCode: string, paramValue: string): Promise<void> {
  await apiClient.put(API_ENDPOINTS.ACCOUNTS_CONFIG_UPSERT(accountId, paramCode), { param_value: paramValue });
}

export interface AccountOcSummary {
  account_id: number;
  oc_config: {
    OC_RATIO: number | null;
    OC_PERCENTILE: number;
    OC_MULTIPLIER_OVERRIDE: number | null;
    OC_LOOKBACK: number;
    MAX_OC_MULTIPLIER: number;
    OC_MULTIPLIER_DECAY: number;
    SL_OC_BUMP: number;
    TP_OC_BUMP: number;
    MIN_OC_PERCENT: number;
    MAX_OC_PERCENT: number;
  };
  live_oc: Array<{
    symbol: string;
    time_frame: string;
    oc_base: number;
    oc_ratio: number | null;
    oc_chained: number;
    adaptive_multiplier: number;
    oc_effective: number;
  }>;
}

export async function getAccountOcSummary(accountId: number): Promise<AccountOcSummary> {
  const res = await apiClient.get<AccountOcSummary>(API_ENDPOINTS.ACCOUNTS_OC_SUMMARY(accountId));
  return res.data;
}

export async function resetAccountOC(accountId: number): Promise<{ success: boolean; cleared: number; message: string }> {
  const res = await apiClient.delete(API_ENDPOINTS.ACCOUNTS_OC_RESET(accountId));
  return res.data;
}

// ─── OC STATES (Admin CRUD) ───────────────────────────────────────────────────

export interface OcStateItem {
  id: number;
  account_id: number;
  account_name: string;
  symbol: string;
  time_frame: string;
  oc_multiplier: number;
  updated_at: string | null;
}

export async function getOcStates(accountId?: number): Promise<{ count: number; oc_states: OcStateItem[] }> {
  const params = accountId !== undefined ? { account_id: accountId } : {};
  const res = await apiClient.get(API_ENDPOINTS.OC_STATES_LIST, { params });
  return res.data;
}

export async function updateOcState(id: number, oc_multiplier: number): Promise<OcStateItem> {
  const res = await apiClient.patch(API_ENDPOINTS.OC_STATES_UPDATE(id), { oc_multiplier });
  return res.data;
}

export async function deleteOcState(id: number): Promise<{ success: boolean; message: string }> {
  const res = await apiClient.delete(API_ENDPOINTS.OC_STATES_DELETE(id));
  return res.data;
}

// ─── SIGNALS ─────────────────────────────────────────────────────────────────

export async function getSignals(params?: { status?: string; limit?: number }): Promise<{ count: number; signals: Signal[] }> {
  const res = await apiClient.get(API_ENDPOINTS.STRATEGY_SIGNALS, { params });
  return res.data;
}

// ─── ORDERS ──────────────────────────────────────────────────────────────────

export async function getOrders(params?: { status?: string; limit?: number }): Promise<{ count: number; orders: Order[] }> {
  const res = await apiClient.get(API_ENDPOINTS.STRATEGY_ORDERS, { params });
  return res.data;
}

// ─── POSITIONS ───────────────────────────────────────────────────────────────

export async function getPositions(params?: { status?: string; limit?: number }): Promise<{ count: number; positions: Position[] }> {
  const res = await apiClient.get(API_ENDPOINTS.STRATEGY_POSITIONS, { params });
  return res.data;
}

export async function getPositionsSummary() {
  const res = await apiClient.get(API_ENDPOINTS.STRATEGY_POSITIONS_SUMMARY);
  return res.data;
}

export async function getAccountPositions(accountId: number) {
  const res = await apiClient.get(API_ENDPOINTS.STRATEGY_POSITIONS_ACCOUNT(accountId));
  return res.data;
}

// ─── STRATEGY ────────────────────────────────────────────────────────────────

export async function getStrategyStatus(): Promise<StrategyStatus> {
  const res = await apiClient.get<StrategyStatus>(API_ENDPOINTS.STRATEGY_STATUS);
  return res.data;
}

export async function getStrategyConfig(): Promise<StrategyConfig> {
  const res = await apiClient.get<StrategyConfig>(API_ENDPOINTS.STRATEGY_CONFIG);
  return res.data;
}

export async function updateStrategyConfig(code: string, value: string) {
  const res = await apiClient.post(API_ENDPOINTS.STRATEGY_CONFIG, { code, value });
  return res.data;
}

export async function toggleStrategy(enabled: boolean) {
  const res = await apiClient.post(API_ENDPOINTS.STRATEGY_TOGGLE, { enabled });
  return res.data;
}

export async function getOcState(): Promise<OcState> {
  const res = await apiClient.get<OcState>(API_ENDPOINTS.STRATEGY_OC_STATE);
  return res.data;
}

export async function getDecayStatus() {
  const res = await apiClient.get(API_ENDPOINTS.STRATEGY_DECAY_STATUS);
  return res.data;
}

export async function getSymbols() {
  const res = await apiClient.get(API_ENDPOINTS.STRATEGY_SYMBOLS);
  return res.data;
}

export async function refreshSymbols() {
  const res = await apiClient.post(API_ENDPOINTS.STRATEGY_SYMBOLS_REFRESH);
  return res.data;
}

// ─── SYSTEM ──────────────────────────────────────────────────────────────────

export async function getBackgroundTasksStatus() {
  const res = await apiClient.get(API_ENDPOINTS.BG_TASKS_STATUS);
  return res.data;
}
