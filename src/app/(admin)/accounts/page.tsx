'use client';

import React, { useEffect, useState } from 'react';
import { getAccounts, updateAccount } from '@/lib/api/bot.service';
import type { AccountConfig } from '@/types/bot';
import Link from 'next/link';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<AccountConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleToggle = async (id: number, currentEnabled: boolean) => {
    try {
      await updateAccount(id, { enabled: !currentEnabled });
      setAccounts(prev => prev.map(a => a.id === id ? { ...a, enabled: !currentEnabled } : a));
    } catch {
      alert('Không thể cập nhật trạng thái account');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý Accounts</h1>
        <button onClick={loadAccounts} className="text-sm px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 transition">
          ↻ Refresh
        </button>
      </div>

      {error && <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 p-4 text-red-600">{error}</div>}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Đang tải...</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  {['ID', 'Tên', 'User ID', 'Trade Amount', 'Leverage', 'OC Ratio', 'Max Sig', 'Max Pos', 'Trạng thái', 'Chi tiết'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {accounts.map(account => (
                  <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-4 py-3 font-mono text-gray-500">{account.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{account.name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{account.user_id ?? '—'}</td>
                    <td className="px-4 py-3 font-mono">${account.trade_amount_usdt}</td>
                    <td className="px-4 py-3 font-mono">{account.leverage}x</td>
                    <td className="px-4 py-3 font-mono">{account.oc_ratio ?? 'auto'}</td>
                    <td className="px-4 py-3 font-mono">{account.max_open_signals}</td>
                    <td className="px-4 py-3 font-mono">{account.max_open_positions}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(account.id, account.enabled)}
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
                      <Link href={`/accounts/${account.id}`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                        Chi tiết →
                      </Link>
                    </td>
                  </tr>
                ))}
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
