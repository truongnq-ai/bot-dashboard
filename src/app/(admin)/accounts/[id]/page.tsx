'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  getAccountById, updateAccount, getAccountBalances,
  getAccountConfig, upsertAccountConfig,
  checkAccountReadiness, seedBalance, getAccountOcSummary, resetAccountOC,
} from '@/lib/api/bot.service';
import type { Account, AccountBalance } from '@/types/bot';
import type { AccountOcSummary } from '@/lib/api/bot.service';

// ─── Param metadata ───────────────────────────────────────────
const TRADING_PARAMS = ['TRADE_AMOUNT_USDT', 'LEVERAGE', 'OC_RATIO', 'MAX_OPEN_SIGNALS', 'MAX_OPEN_POSITIONS', 'TIME_FRAMES'];
const ADVANCED_PARAMS = ['OC_PERCENTILE', 'OC_LOOKBACK', 'TRIGGER_RATIO', 'SL_OC_RATIO', 'TP_OC_RATIO', 'MIN_SL_OC_RATIO', 'DECAY_RATE', 'SL_OC_BUMP', 'TP_OC_BUMP', 'OC_MULTIPLIER_DECAY', 'MAX_OC_MULTIPLIER', 'MIN_VOLUME_USDT'];

const PARAM_LABELS: Record<string, string> = {
  TRADE_AMOUNT_USDT: 'Vốn mỗi lệnh (USDT)', LEVERAGE: 'Đòn bẩy (×)', OC_RATIO: 'OC Ratio',
  MAX_OPEN_SIGNALS: 'Max Signals', MAX_OPEN_POSITIONS: 'Max Positions', TIME_FRAMES: 'Time Frames ⚠️',
  OC_PERCENTILE: 'OC Percentile', OC_LOOKBACK: 'OC Lookback (nến)', TRIGGER_RATIO: 'Trigger Ratio (%)',
  SL_OC_RATIO: 'SL/OC Ratio', TP_OC_RATIO: 'TP/OC Ratio', MIN_SL_OC_RATIO: 'Min SL/OC Ratio',
  DECAY_RATE: 'Decay Rate', SL_OC_BUMP: 'SL OC Bump', TP_OC_BUMP: 'TP OC Bump',
  OC_MULTIPLIER_DECAY: 'OC Multiplier Decay', MAX_OC_MULTIPLIER: 'Max OC Multiplier', MIN_VOLUME_USDT: 'Min Volume (USDT)',
};

const fmt = (n: number) => n.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pnlCls = (v: number) => v > 0 ? 'text-green-600 dark:text-green-400' : v < 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-500';

type ActiveTab = 'info' | 'balance' | 'config' | 'oc';

export default function AccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const accountId = parseInt(id);

  const [account, setAccount] = useState<Account | null>(null);
  const [balance, setBalance] = useState<AccountBalance | null>(null);
  const [configData, setConfigData] = useState<{ effective_config: Record<string, unknown>; overrides: Record<string, string> } | null>(null);
  const [readiness, setReadiness] = useState<{ ready: boolean; warnings: string[] } | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('info');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Config editing
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [savingParam, setSavingParam] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // OC tab
  const [ocData, setOcData] = useState<AccountOcSummary | null>(null);
  const [ocLoading, setOcLoading] = useState(false);
  const [resettingOC, setResettingOC] = useState(false);

  // Seed balance modal
  const [showSeed, setShowSeed] = useState(false);
  const [seedAmount, setSeedAmount] = useState('1000');
  const [seeding, setSeeding] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [acc, balData, cfgData, readData] = await Promise.all([
        getAccountById(accountId),
        getAccountBalances(accountId).catch(() => null),
        getAccountConfig(accountId).catch(() => null),
        checkAccountReadiness(accountId).catch(() => null),
      ]);
      setAccount(acc);
      setBalance(balData?.balances.find(b => b.balance_type === 'FUTURES') ?? null);
      setConfigData(cfgData ?? null);
      setReadiness(readData);
      // Init edit values from effective config
      if (cfgData) {
        const init: Record<string, string> = {};
        for (const [k, v] of Object.entries(cfgData.effective_config)) {
          init[k] = v === null || v === undefined ? 'null' : String(v);
        }
        setEditValues(init);
      }
      setError(null);
    } catch {
      setError('Không thể tải thông tin account');
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async () => {
    if (!account) return;
    await updateAccount(accountId, { enabled: !account.enabled });
    setAccount((prev: Account | null) => prev ? { ...prev, enabled: !prev.enabled } : prev);
  };

  const handleTabChange = async (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'oc' && !ocData) {
      setOcLoading(true);
      try {
        const data = await getAccountOcSummary(accountId);
        setOcData(data);
      } catch {
        // silent — sẽ hiển thị empty state
      } finally {
        setOcLoading(false);
      }
    }
  };

  const handleSaveParam = async (code: string) => {
    const val = editValues[code] ?? '';
    setSavingParam(code);
    try {
      await upsertAccountConfig(accountId, code, val);
      setConfigData(prev => prev ? { ...prev, overrides: { ...prev.overrides, [code]: val } } : prev);
    } catch {
      alert(`Không thể lưu ${code}`);
    } finally {
      setSavingParam(null);
    }
  };

  const handleSeed = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(seedAmount);
    if (isNaN(amount) || amount <= 0) return;
    try {
      setSeeding(true);
      await seedBalance(accountId, { balance_type: 'FUTURES', initial_balance: amount });
      setShowSeed(false);
      await load();
    } catch { alert('Không thể seed balance (có thể đã tồn tại)'); }
    finally { setSeeding(false); }
  };

  const handleResetOC = async () => {
    if (!confirm(`Reset toàn bộ OC Multiplier về 1.0x cho account "${account?.name}"?\nHành động này có hiệu lực ngay lập tức.`)) return;
    setResettingOC(true);
    try {
      const res = await resetAccountOC(accountId);
      alert(res.message);
      // Refresh OC data
      const data = await getAccountOcSummary(accountId);
      setOcData(data);
    } catch {
      alert('Không thể reset OC. Vui lòng thử lại.');
    } finally {
      setResettingOC(false);
    }
  };

  if (loading) return <div className="text-center py-16 text-gray-400">Đang tải...</div>;
  if (error || !account) return <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 p-4 text-sm text-red-600">{error ?? 'Account không tồn tại'}</div>;

  const inputCls = 'w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono';

  const renderConfigParam = (code: string) => {
    const isOverride = !!(configData?.overrides[code]);
    const isSaving = savingParam === code;
    const currentVal = editValues[code] ?? '';
    const originalVal = configData?.overrides[code] ?? (configData?.effective_config[code] === null ? 'null' : String(configData?.effective_config[code] ?? ''));
    const isDirty = currentVal !== originalVal;
    return (
      <div key={code} className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {PARAM_LABELS[code] ?? code}
          </label>
          {isOverride ? (
            <span className="text-xs text-blue-500">● override</span>
          ) : (
            <span className="text-xs text-gray-400">default</span>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={currentVal}
            onChange={e => setEditValues(prev => ({ ...prev, [code]: e.target.value }))}
            className={inputCls}
          />
          {isDirty && (
            <button
              onClick={() => handleSaveParam(code)}
              disabled={isSaving}
              className="px-2.5 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
            >
              {isSaving ? '...' : 'Lưu'}
            </button>
          )}
        </div>
      </div>
    );
  };

  const tabs: { key: ActiveTab; label: string }[] = [
    { key: 'info', label: '📋 Thông tin' },
    { key: 'balance', label: '💰 Balance' },
    { key: 'config', label: '⚙️ Config' },
    { key: 'oc', label: '📊 OC' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/accounts')} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition">
            ← Accounts
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{account.name}</h1>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${account.enabled ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700'}`}>
            {account.enabled ? '● Enabled' : '○ Disabled'}
          </span>
        </div>
        <button
          onClick={handleToggle}
          className={`text-sm px-3 py-1.5 rounded-lg transition font-medium ${account.enabled ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 hover:bg-red-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
        >
          {account.enabled ? 'Disable' : 'Enable'}
        </button>
      </div>

      {/* Readiness warnings */}
      {readiness && readiness.warnings.length > 0 && (
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-1">⚠️ Chưa sẵn sàng trade:</p>
          <ul className="text-sm text-amber-600 dark:text-amber-400 space-y-0.5">
            {readiness.warnings.map((w, i) => <li key={i}>• {w}</li>)}
          </ul>
        </div>
      )}
      {readiness?.ready && (
        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-2 text-sm text-green-700 dark:text-green-400">
          ✅ Account sẵn sàng trade
        </div>
      )}

      {/* Tab navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-0">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => handleTabChange(t.key)}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition ${activeTab === t.key ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Tab: Thông tin ─── */}
      {activeTab === 'info' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-6 py-5 grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-xs text-gray-400 mb-1">Account ID</p><p className="font-mono text-gray-600 dark:text-gray-300">#{account.id}</p></div>
            <div><p className="text-xs text-gray-400 mb-1">User ID</p><p className="font-mono text-gray-600 dark:text-gray-300">{account.user_id ?? '—'}</p></div>
            <div className="col-span-2"><p className="text-xs text-gray-400 mb-1">Mô tả</p><p className="text-gray-700 dark:text-gray-300">{account.description || '—'}</p></div>
          </div>
        </div>
      )}

      {/* ─── Tab: Balance ─── */}
      {activeTab === 'balance' && (
        <div className="space-y-4">
          {balance ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Vốn ban đầu', val: `$${fmt(balance.initial_balance)}`, cls: 'text-gray-900 dark:text-white' },
                  { label: 'Total Equity', val: `$${fmt(balance.total_equity ?? balance.equity)}`, cls: pnlCls((balance.total_equity ?? balance.equity) - balance.initial_balance) },
                  { label: 'Available', val: `$${fmt(balance.available_equity)}`, cls: 'text-blue-600 dark:text-blue-400' },
                  { label: 'Margin Lock', val: `$${fmt(balance.margin_used)}`, cls: 'text-amber-600 dark:text-amber-400' },
                  { label: 'Unrealized PnL', val: `${balance.unrealized_pnl >= 0 ? '+' : ''}${fmt(balance.unrealized_pnl)}`, cls: pnlCls(balance.unrealized_pnl) },
                  { label: 'Realized PnL', val: `${balance.realized_pnl >= 0 ? '+' : ''}${fmt(balance.realized_pnl)}`, cls: pnlCls(balance.realized_pnl) },
                  { label: 'Fee tổng', val: fmt(balance.fee_total), cls: 'text-gray-500' },
                  { label: 'Net PnL', val: `${(balance.realized_pnl - balance.fee_total) >= 0 ? '+' : ''}${fmt(balance.realized_pnl - balance.fee_total)}`, cls: pnlCls(balance.realized_pnl - balance.fee_total) },
                ].map(c => (
                  <div key={c.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
                    <p className="text-xs text-gray-400 mb-1">{c.label}</p>
                    <p className={`text-base font-bold ${c.cls}`}>{c.val}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400">Type: FUTURES | Balance ID: #{balance.id}</p>
            </>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
              <p className="text-gray-500 mb-3">Account chưa có FUTURES balance</p>
              <button onClick={() => setShowSeed(true)} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                Seed Balance ngay
              </button>
            </div>
          )}
          {balance && (
            <button onClick={() => setShowSeed(true)} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              + Seed thêm vốn
            </button>
          )}
        </div>
      )}

      {/* ─── Tab: Config ─── */}
      {activeTab === 'config' && configData && (
        <div className="space-y-4">
          {/* Trading params */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">⚙️ Cấu hình giao dịch</h3>
              <p className="text-xs text-gray-400">Tự động áp dụng ngay khi lưu</p>
            </div>
            <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TRADING_PARAMS.map(renderConfigParam)}
            </div>
          </div>

          {/* Advanced params */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <button
              onClick={() => setShowAdvanced(v => !v)}
              className="w-full px-5 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900/70 transition"
            >
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white text-left">🔬 Cấu hình nâng cao</h3>
                <p className="text-xs text-gray-400 text-left">SL/TP ratio, Decay, OC tuning</p>
              </div>
              <span className="text-gray-400">{showAdvanced ? '▲' : '▼'}</span>
            </button>
            {showAdvanced && (
              <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-700">
                {ADVANCED_PARAMS.map(renderConfigParam)}
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400">● override = đã có row trong DB | default = dùng từ config.py</p>
        </div>
      )}

      {/* ─── Tab: OC ─── */}
      {activeTab === 'oc' && (
        <div className="space-y-4">
          {ocLoading ? (
            <div className="text-center py-10 text-gray-400 text-sm">Đang tải dữ liệu OC...</div>
          ) : (
            <>
              {/* Card: OC Config của account */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">📊 Cấu hình OC của Account</h3>
                  <p className="text-xs text-gray-400">Các params xác định ngưỡng entry của account này</p>
                </div>
                <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {ocData && ([
                    { label: 'OC Ratio', val: ocData.oc_config.OC_RATIO ?? 'auto-chain', note: 'Nhân bội vs OC base', highlight: true },
                    { label: 'OC Percentile', val: `P${ocData.oc_config.OC_PERCENTILE}`, note: 'Mức P tính base', highlight: false },
                    { label: 'Multiplier Override', val: ocData.oc_config.OC_MULTIPLIER_OVERRIDE ?? 'adaptive', note: 'null = tự động', highlight: false },
                    { label: 'OC Lookback', val: `${ocData.oc_config.OC_LOOKBACK} nến`, note: 'Số nến lịch sử', highlight: false },
                    { label: 'Max Multiplier', val: `×${ocData.oc_config.MAX_OC_MULTIPLIER}`, note: 'Trần adaptive', highlight: false },
                    { label: 'Multiplier Decay', val: ocData.oc_config.OC_MULTIPLIER_DECAY, note: 'Per candle', highlight: false },
                    { label: 'SL OC Bump', val: `+${ocData.oc_config.SL_OC_BUMP}`, note: 'Tăng khi hit SL', highlight: false },
                    { label: 'TP OC Bump', val: `+${ocData.oc_config.TP_OC_BUMP}`, note: 'Tăng khi hit TP', highlight: false },
                  ] as { label: string; val: string | number; note: string; highlight: boolean }[]).map(item => (
                    <div key={item.label}>
                      <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                      <p className={`text-sm font-bold font-mono ${
                        item.highlight ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                      }`}>{String(item.val)}</p>
                      <p className="text-xs text-gray-400">{item.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bảng Live OC per Symbol/TF */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">📡 Live OC per Symbol / TF</h3>
                    <p className="text-xs text-gray-400">Dữ liệu real-time từ rolling window — cần bot đang chạy</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {ocData && ocData.live_oc.some(r => r.adaptive_multiplier > 1.001) && (
                      <button
                        onClick={handleResetOC}
                        disabled={resettingOC}
                        className="text-xs px-2.5 py-1 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/60 transition font-medium disabled:opacity-50"
                      >
                        {resettingOC ? '⏳ Resetting...' : '🔄 Reset OC'}
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        setOcLoading(true);
                        try { setOcData(await getAccountOcSummary(accountId)); } catch { /* silent */ }
                        finally { setOcLoading(false); }
                      }}
                      className="text-xs text-blue-500 hover:text-blue-700 transition"
                    >↻ Refresh</button>
                  </div>
                </div>
                {!ocData || ocData.live_oc.length === 0 ? (
                  <div className="px-5 py-10 text-center text-sm text-gray-400">
                    Chưa có dữ liệu OC live — bot chưa chạy hoặc chưa bootstrap xong
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                          <th className="px-4 py-2.5 text-left font-medium">Symbol</th>
                          <th className="px-4 py-2.5 text-left font-medium">TF</th>
                          <th className="px-4 py-2.5 text-right font-medium">OC Base (P95)</th>
                          <th className="px-4 py-2.5 text-right font-medium">OC Ratio</th>
                          <th className="px-4 py-2.5 text-right font-medium">OC Chained</th>
                          <th className="px-4 py-2.5 text-right font-medium">Multiplier</th>
                          <th className="px-4 py-2.5 text-right font-medium">OC Effective</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                        {ocData.live_oc.map((row, i) => {
                          const multActive = row.adaptive_multiplier > 1.001;
                          return (
                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition">
                              <td className="px-4 py-2.5 font-mono font-medium text-gray-900 dark:text-white">{row.symbol}</td>
                              <td className="px-4 py-2.5">
                                <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs font-mono text-gray-600 dark:text-gray-300">{row.time_frame}</span>
                              </td>
                              <td className="px-4 py-2.5 text-right font-mono text-gray-600 dark:text-gray-300">{row.oc_base.toFixed(4)}%</td>
                              <td className="px-4 py-2.5 text-right font-mono text-gray-500">
                                {row.oc_ratio !== null ? `×${row.oc_ratio}` : 'auto'}
                              </td>
                              <td className="px-4 py-2.5 text-right font-mono text-gray-600 dark:text-gray-300">{row.oc_chained.toFixed(4)}%</td>
                              <td className="px-4 py-2.5 text-right font-mono">
                                <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                                  multActive
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                                    : 'text-gray-400'
                                }`}>×{row.adaptive_multiplier.toFixed(2)}</span>
                              </td>
                              <td className="px-4 py-2.5 text-right">
                                <span className={`font-mono font-bold text-sm ${
                                  multActive
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-blue-600 dark:text-blue-400'
                                }`}>{row.oc_effective.toFixed(4)}%</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── Seed Balance Modal ─── */}
      {showSeed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm mx-4">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Seed Balance — {account.name}</h2>
            </div>
            <form onSubmit={handleSeed} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vốn ban đầu (USDT) *</label>
                <input type="number" value={seedAmount} onChange={e => setSeedAmount(e.target.value)} required min="1" step="any"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                <p className="mt-1 text-xs text-gray-400">Balance type: FUTURES</p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowSeed(false)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">Hủy</button>
                <button type="submit" disabled={seeding} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium">
                  {seeding ? 'Đang seed...' : 'Seed Balance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
