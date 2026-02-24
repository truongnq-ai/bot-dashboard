'use client';

import React, { useEffect, useState } from 'react';
import { getAccounts, updateAccount, seedBalance, checkAccountReadiness } from '@/lib/api/bot.service';
import type { Account } from '@/types/bot';
import Link from 'next/link';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Seed Balance modal
  const [showSeed, setShowSeed] = useState(false);
  const [seedAccountId, setSeedAccountId] = useState<number | null>(null);
  const [seedAccountName, setSeedAccountName] = useState('');
  const [seedAmount, setSeedAmount] = useState('1000');
  const [seeding, setSeeding] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);

  // Readiness warning modal
  const [showWarning, setShowWarning] = useState(false);
  const [warningAccountId, setWarningAccountId] = useState<number | null>(null);
  const [warningAccountName, setWarningAccountName] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await getAccounts();
      setAccounts(data.accounts);
      setError(null);
    } catch {
      setError('Không thể tải danh sách accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAccounts(); }, []);

  // ────── Toggle enable/disable với readiness check ──────
  const handleToggle = async (id: number, name: string, currentEnabled: boolean) => {
    if (!currentEnabled) {
      try {
        const readiness = await checkAccountReadiness(id);
        if (readiness.warnings.length > 0) {
          setWarningAccountId(id);
          setWarningAccountName(name);
          setWarnings(readiness.warnings);
          setShowWarning(true);
          return;
        }
      } catch { /* ignore, proceed anyway */ }
    }
    await doToggle(id, currentEnabled);
  };

  const doToggle = async (id: number, currentEnabled: boolean) => {
    try {
      await updateAccount(id, { enabled: !currentEnabled });
      setAccounts(prev => prev.map(a => a.id === id ? { ...a, enabled: !currentEnabled } : a));
    } catch {
      alert('Không thể cập nhật trạng thái account');
    }
  };

  // ────── Seed Balance ──────
  const openSeedModal = (accountId: number, name: string) => {
    setSeedAccountId(accountId);
    setSeedAccountName(name);
    setSeedAmount('1000');
    setSeedError(null);
    setShowSeed(true);
  };

  const handleSeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seedAccountId) return;
    const amount = parseFloat(seedAmount);
    if (isNaN(amount) || amount <= 0) {
      setSeedError('Số tiền phải > 0');
      return;
    }
    try {
      setSeeding(true);
      setSeedError(null);
      await seedBalance(seedAccountId, { balance_type: 'FUTURES', initial_balance: amount });
      setShowSeed(false);
      alert(`✅ Seed ${amount} USDT cho ${seedAccountName} thành công!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể seed balance (có thể đã tồn tại)';
      setSeedError(msg);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý Accounts</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/accounts/new"
            className="text-sm px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
          >
            + Thêm Account
          </Link>
          <button onClick={loadAccounts} className="text-sm px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 transition">
            ↻ Refresh
          </button>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 p-4 text-red-600">{error}</div>}

      {/* ── Modal Seed Balance ── */}
      {showSeed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-sm mx-4">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Seed Balance — {seedAccountName}</h2>
            </div>
            <form onSubmit={handleSeed} className="px-6 py-5 space-y-4">
              {seedError && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-600 dark:text-red-400">{seedError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vốn ban đầu (USDT) *</label>
                <input type="number" value={seedAmount} onChange={e => setSeedAmount(e.target.value)} required min="1" step="any"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1000" />
                <p className="mt-1 text-xs text-gray-400">Balance type: FUTURES</p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowSeed(false)}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 transition">Hủy</button>
                <button type="submit" disabled={seeding}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium">
                  {seeding ? 'Đang seed...' : 'Seed Balance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Warning khi Enable ── */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4">
            <div className="px-6 py-5 space-y-4">
              <div className="text-center">
                <div className="text-3xl mb-2">⚠️</div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account chưa sẵn sàng</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{warningAccountName}</p>
              </div>
              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
                <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
                  {warnings.map((w, i) => (
                    <li key={i}>⚠ {w}</li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-center gap-2 pt-2">
                <button onClick={() => setShowWarning(false)}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 transition">Hủy</button>
                <button onClick={async () => {
                  if (warningAccountId) await doToggle(warningAccountId, false);
                  setShowWarning(false);
                }}
                  className="px-4 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium">
                  Enable anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Đang tải...</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  {['ID', 'Tên', 'User ID', 'Trade Amount', 'Leverage', 'OC Ratio', 'Max Sig', 'Max Pos', 'Trạng thái', 'Thao tác'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {accounts.map(account => {
                  const cfg = account.effective_config;
                  return (
                    <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <td className="px-4 py-3 font-mono text-gray-500">{account.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{account.name}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{account.user_id ?? '—'}</td>
                      <td className="px-4 py-3 font-mono">${cfg?.TRADE_AMOUNT_USDT ?? '—'}</td>
                      <td className="px-4 py-3 font-mono">{cfg?.LEVERAGE ?? '—'}x</td>
                      <td className="px-4 py-3 font-mono">{cfg?.OC_RATIO ?? 'auto'}</td>
                      <td className="px-4 py-3 font-mono">{cfg?.MAX_OPEN_SIGNALS ?? '—'}</td>
                      <td className="px-4 py-3 font-mono">{cfg?.MAX_OPEN_POSITIONS ?? '—'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggle(account.id, account.name, account.enabled)}
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition ${
                            account.enabled
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          {account.enabled ? '● Enabled' : '○ Disabled'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openSeedModal(account.id, account.name)}
                            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">Seed$</button>
                          <Link href={`/accounts/${account.id}`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                            Chi tiết →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {accounts.length === 0 && (
                  <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-400">Không có account nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400">
            Tổng: {accounts.length} accounts
          </div>
        </div>
      )}
    </div>
  );
}
