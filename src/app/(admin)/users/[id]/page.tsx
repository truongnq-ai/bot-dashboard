'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getUserById, getUserSummary, getAccounts } from '@/lib/api/bot.service';
import type { UserPublic, UserSummary, Account } from '@/types/bot';
import Link from 'next/link';

const fmt = (n: number) =>
  n.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pnlCls = (v: number) =>
  v > 0 ? 'text-green-600 dark:text-green-400' : v < 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-500';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const userId = parseInt(id);

  const [user, setUser] = useState<UserPublic | null>(null);
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [userData, summaryData, accData] = await Promise.all([
          getUserById(userId),
          getUserSummary(userId).catch(() => null),
          getAccounts(),
        ]);
        setUser(userData);
        setSummary(summaryData);
        setAccounts(accData.accounts.filter(a => a.user_id === userId));
        setError(null);
      } catch {
        setError('Không thể tải thông tin user');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  if (loading) return <div className="text-center py-16 text-gray-400">Đang tải...</div>;
  if (error || !user) return <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 p-4 text-red-600">{error ?? 'User không tồn tại'}</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/users')} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition">
          ← Users
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chi tiết User #{userId}</h1>
      </div>

      {/* Info card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span>👤</span> Thông tin tài khoản
          </h2>
          <div className="flex items-center gap-2">
            {user.is_superuser && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400">★ Superuser</span>
            )}
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
              {user.is_active ? '● Active' : '● Inactive'}
            </span>
          </div>
        </div>
        <div className="px-6 py-5 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-400 mb-1">Email</p>
            <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Họ tên</p>
            <p className="font-medium text-gray-900 dark:text-white">{user.full_name || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">User ID</p>
            <p className="font-mono text-gray-600 dark:text-gray-300">#{user.id}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Số lượng Accounts</p>
            <p className="font-medium text-gray-900 dark:text-white">{accounts.length} accounts</p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">Tổng Equity</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">${fmt(summary.total_equity)}</p>
            <p className="text-xs text-gray-400 mt-0.5">Vốn BD: ${fmt(summary.total_initial_balance)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">Margin lock</p>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">${fmt(summary.total_margin_used)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">Realized PnL</p>
            <p className={`text-lg font-bold ${pnlCls(summary.total_realized_pnl)}`}>
              {summary.total_realized_pnl >= 0 ? '+' : ''}${fmt(summary.total_realized_pnl)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">Net PnL (sau phí)</p>
            <p className={`text-lg font-bold ${pnlCls(summary.total_pnl_net)}`}>
              {summary.total_pnl_net >= 0 ? '+' : ''}${fmt(summary.total_pnl_net)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Fee: ${fmt(summary.total_fee)}</p>
          </div>
        </div>
      )}

      {/* Accounts table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span>📋</span> Accounts ({accounts.length})
          </h2>
          <Link href="/accounts/new" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">+ Thêm account</Link>
        </div>
        {accounts.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-400 text-sm">User này chưa có account nào</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/30">
                <tr>
                  {['ID', 'Tên', 'Trade Amount', 'Leverage', 'OC Ratio', 'Trạng thái', 'Chi tiết'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {accounts.map(acc => {
                  const cfg = acc.effective_config;
                  return (
                    <tr key={acc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <td className="px-4 py-3 font-mono text-gray-500">{acc.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{acc.name}</td>
                      <td className="px-4 py-3 font-mono">${cfg?.TRADE_AMOUNT_USDT ?? '—'}</td>
                      <td className="px-4 py-3 font-mono">{cfg?.LEVERAGE ?? '—'}x</td>
                      <td className="px-4 py-3 font-mono">{cfg?.OC_RATIO ?? 'auto'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${acc.enabled ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700'}`}>
                          {acc.enabled ? '● Enabled' : '○ Disabled'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/accounts/${acc.id}`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Chi tiết →</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
