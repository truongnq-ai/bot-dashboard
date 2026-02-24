'use client';

import React, { useEffect, useState } from 'react';
import { getAccounts, getAccountBalances } from '@/lib/api/bot.service';
import type { Account, AccountBalance } from '@/types/bot';
import Link from 'next/link';

interface AccountWithBalance {
  account: Account;
  balance: AccountBalance | null;
}

const fmt = (n: number) =>
  n.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const pnlCls = (v: number) =>
  v > 0 ? 'text-green-600 dark:text-green-400' : v < 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-500';

export default function BalancesPage() {
  const [rows, setRows] = useState<AccountWithBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const accs = await getAccounts();
      const results = await Promise.all(
        accs.accounts.map(async (acc): Promise<AccountWithBalance> => {
          try {
            const data = await getAccountBalances(acc.id);
            const futures = data.balances.find(b => b.balance_type === 'FUTURES') ?? null;
            return { account: acc, balance: futures };
          } catch {
            return { account: acc, balance: null };
          }
        })
      );
      setRows(results);
      setError(null);
    } catch {
      setError('Không thể tải dữ liệu balances');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Totals
  const totals = rows.reduce(
    (acc, r) => {
      if (!r.balance) return acc;
      return {
        initial: acc.initial + r.balance.initial_balance,
        equity: acc.equity + r.balance.equity,
        available: acc.available + r.balance.available_equity,
        margin: acc.margin + r.balance.margin_used,
        unrealized: acc.unrealized + r.balance.unrealized_pnl,
        realized: acc.realized + r.balance.realized_pnl,
        fee: acc.fee + r.balance.fee_total,
        total: acc.total + (r.balance.total_equity ?? r.balance.equity),
      };
    },
    { initial: 0, equity: 0, available: 0, margin: 0, unrealized: 0, realized: 0, fee: 0, total: 0 }
  );

  const withBalance = rows.filter(r => r.balance).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Balances — Tổng quan</h1>
        <button onClick={load} className="text-sm px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 transition">
          ↻ Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Tổng vốn ban đầu', value: `$${fmt(totals.initial)}`, sub: '' },
          { label: 'Tổng Total Equity', value: `$${fmt(totals.total)}`, sub: `Unrealized: ${totals.unrealized >= 0 ? '+' : ''}${fmt(totals.unrealized)}`, cls: pnlCls(totals.total - totals.initial) },
          { label: 'Tổng Available', value: `$${fmt(totals.available)}`, sub: `Margin locked: $${fmt(totals.margin)}` },
          { label: 'Net PnL (sau phí)', value: `${totals.realized - totals.fee >= 0 ? '+' : ''}$${fmt(totals.realized - totals.fee)}`, sub: `Realized: ${fmt(totals.realized)} | Fee: ${fmt(totals.fee)}`, cls: pnlCls(totals.realized - totals.fee) },
        ].map(c => (
          <div key={c.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">{c.label}</p>
            <p className={`text-lg font-bold ${c.cls ?? 'text-gray-900 dark:text-white'}`}>{c.value}</p>
            {c.sub && <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>}
          </div>
        ))}
      </div>

      {error && <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 p-4 text-sm text-red-600">{error}</div>}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Đang tải...</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  {['Account', 'Trạng thái', 'Vốn BD', 'Equity', 'Available', 'Margin Lock', 'Unrealized', 'Realized', 'Fee', 'Total Equity', ''].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {rows.map(({ account, balance }) => (
                  <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-3 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">{account.name}</div>
                      <div className="text-xs text-gray-400">ID: {account.id}</div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${account.enabled ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700'}`}>
                        {account.enabled ? '● Active' : '○ Off'}
                      </span>
                    </td>
                    {balance ? (
                      <>
                        <td className="px-3 py-3 font-mono text-gray-600 dark:text-gray-300">${fmt(balance.initial_balance)}</td>
                        <td className="px-3 py-3 font-mono text-gray-900 dark:text-white">${fmt(balance.equity)}</td>
                        <td className="px-3 py-3 font-mono text-blue-600 dark:text-blue-400">${fmt(balance.available_equity)}</td>
                        <td className="px-3 py-3 font-mono text-amber-600 dark:text-amber-400">${fmt(balance.margin_used)}</td>
                        <td className={`px-3 py-3 font-mono ${pnlCls(balance.unrealized_pnl)}`}>
                          {balance.unrealized_pnl >= 0 ? '+' : ''}{fmt(balance.unrealized_pnl)}
                        </td>
                        <td className={`px-3 py-3 font-mono ${pnlCls(balance.realized_pnl)}`}>
                          {balance.realized_pnl >= 0 ? '+' : ''}{fmt(balance.realized_pnl)}
                        </td>
                        <td className="px-3 py-3 font-mono text-gray-500">{fmt(balance.fee_total)}</td>
                        <td className={`px-3 py-3 font-mono font-semibold ${pnlCls((balance.total_equity ?? balance.equity) - balance.initial_balance)}`}>
                          ${fmt(balance.total_equity ?? balance.equity)}
                        </td>
                      </>
                    ) : (
                      <td colSpan={8} className="px-3 py-3 text-xs text-gray-400 italic">Chưa seed balance</td>
                    )}
                    <td className="px-3 py-3">
                      <Link href={`/accounts/${account.id}`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap">
                        Chi tiết →
                      </Link>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={11} className="px-4 py-8 text-center text-gray-400">Không có account nào</td></tr>
                )}
              </tbody>
              {/* Footer tổng cộng */}
              {withBalance > 0 && (
                <tfoot className="bg-gray-50 dark:bg-gray-900/60 border-t-2 border-gray-200 dark:border-gray-600">
                  <tr>
                    <td className="px-3 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300">
                      Tổng ({withBalance} accounts)
                    </td>
                    <td />
                    <td className="px-3 py-3 font-mono font-semibold text-xs text-gray-600 dark:text-gray-300">${fmt(totals.initial)}</td>
                    <td className="px-3 py-3 font-mono font-semibold text-xs text-gray-900 dark:text-white">${fmt(totals.equity)}</td>
                    <td className="px-3 py-3 font-mono font-semibold text-xs text-blue-600">${fmt(totals.available)}</td>
                    <td className="px-3 py-3 font-mono font-semibold text-xs text-amber-600">${fmt(totals.margin)}</td>
                    <td className={`px-3 py-3 font-mono font-semibold text-xs ${pnlCls(totals.unrealized)}`}>{totals.unrealized >= 0 ? '+' : ''}{fmt(totals.unrealized)}</td>
                    <td className={`px-3 py-3 font-mono font-semibold text-xs ${pnlCls(totals.realized)}`}>{totals.realized >= 0 ? '+' : ''}{fmt(totals.realized)}</td>
                    <td className="px-3 py-3 font-mono font-semibold text-xs text-gray-500">{fmt(totals.fee)}</td>
                    <td className={`px-3 py-3 font-mono font-bold text-xs ${pnlCls(totals.total - totals.initial)}`}>${fmt(totals.total)}</td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
