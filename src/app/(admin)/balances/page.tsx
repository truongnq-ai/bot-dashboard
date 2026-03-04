'use client';

import React, { useEffect, useState } from 'react';
import { getAccounts, getAccountBalances } from '@/lib/api/bot.service';
import type { Account, AccountBalance } from '@/types/bot';
import Link from 'next/link';

interface WalletPair {
  account: Account;
  spot: AccountBalance | null;
  futures: AccountBalance | null;
}

const fmt = (n: number) =>
  n.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const pnlCls = (v: number) =>
  v > 0 ? 'text-green-600 dark:text-green-400' : v < 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-500';

export default function BalancesPage() {
  const [rows, setRows] = useState<WalletPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const accs = await getAccounts();
      const results = await Promise.all(
        accs.accounts.map(async (acc): Promise<WalletPair> => {
          try {
            const data = await getAccountBalances(acc.id);
            return {
              account: acc,
              spot: data.balances.find(b => b.balance_type === 'SPOT') ?? null,
              futures: data.balances.find(b => b.balance_type === 'FUTURES') ?? null,
            };
          } catch {
            return { account: acc, spot: null, futures: null };
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
    (acc, r) => ({
      spot: acc.spot + (r.spot?.equity ?? 0),
      futures: acc.futures + (r.futures?.equity ?? 0),
      spotInitial: acc.spotInitial + (r.spot?.initial_balance ?? 0),
      futuresInitial: acc.futuresInitial + (r.futures?.initial_balance ?? 0),
      available: acc.available + (r.futures?.available_equity ?? 0),
      margin: acc.margin + (r.futures?.margin_used ?? 0),
      unrealized: acc.unrealized + (r.futures?.unrealized_pnl ?? 0),
      realized: acc.realized + (r.futures?.realized_pnl ?? 0),
      fee: acc.fee + (r.futures?.fee_total ?? 0),
    }),
    { spot: 0, futures: 0, spotInitial: 0, futuresInitial: 0, available: 0, margin: 0, unrealized: 0, realized: 0, fee: 0 }
  );
  const totalEquity = totals.spot + totals.futures;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Balances — Dual Wallet</h1>
        <button onClick={load} className="text-sm px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 transition">
          ↻ Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Tổng Equity (SPOT + FUTURES)', value: `$${fmt(totalEquity)}`, sub: `SPOT: $${fmt(totals.spot)} | FUTURES: $${fmt(totals.futures)}`, cls: '' },
          { label: 'FUTURES Available', value: `$${fmt(totals.available)}`, sub: `Margin locked: $${fmt(totals.margin)}`, cls: 'text-blue-600 dark:text-blue-400' },
          { label: 'Unrealized PnL', value: `${totals.unrealized >= 0 ? '+' : ''}$${fmt(totals.unrealized)}`, sub: '', cls: pnlCls(totals.unrealized) },
          { label: 'Net PnL (sau phí)', value: `${totals.realized - totals.fee >= 0 ? '+' : ''}$${fmt(totals.realized - totals.fee)}`, sub: `Realized: ${fmt(totals.realized)} | Fee: ${fmt(totals.fee)}`, cls: pnlCls(totals.realized - totals.fee) },
        ].map(c => (
          <div key={c.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">{c.label}</p>
            <p className={`text-lg font-bold ${c.cls || 'text-gray-900 dark:text-white'}`}>{c.value}</p>
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
                  {['Account', 'Trạng thái', 'Loại ví', 'Vốn BD', 'Equity', 'Available', 'Margin Lock', 'Unrealized', 'Realized', 'Fee', ''].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {rows.map(({ account, spot, futures }) => {
                  const hasBoth = spot !== null || futures !== null;

                  // SPOT row
                  const spotRow = (
                    <tr key={`${account.id}-spot`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      {/* Account cell — rowspan logic: chỉ show ở SPOT row */}
                      <td className="px-3 py-3" rowSpan={2}>
                        <div className="font-medium text-gray-900 dark:text-white">{account.name}</div>
                        <div className="text-xs text-gray-400">ID: {account.id}</div>
                      </td>
                      <td className="px-3 py-3" rowSpan={2}>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${account.enabled ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700'}`}>
                          {account.enabled ? '● Active' : '○ Off'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">🏦 SPOT</span>
                      </td>
                      {spot ? (
                        <>
                          <td className="px-3 py-3 font-mono text-gray-600 dark:text-gray-300">${fmt(spot.initial_balance)}</td>
                          <td className="px-3 py-3 font-mono text-gray-900 dark:text-white font-semibold">${fmt(spot.equity)}</td>
                          <td className="px-3 py-3 font-mono text-blue-600 dark:text-blue-400">${fmt(spot.equity)}</td>
                          <td className="px-3 py-3 font-mono text-gray-400">—</td>
                          <td className="px-3 py-3 font-mono text-gray-400">—</td>
                          <td className="px-3 py-3 font-mono text-gray-400">—</td>
                          <td className="px-3 py-3 font-mono text-gray-400">—</td>
                        </>
                      ) : (
                        <td colSpan={7} className="px-3 py-3 text-xs text-gray-400 italic">Chưa seed SPOT</td>
                      )}
                      <td className="px-3 py-3" rowSpan={2}>
                        <Link href={`/accounts/${account.id}`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap">
                          Chi tiết →
                        </Link>
                      </td>
                    </tr>
                  );

                  // FUTURES row
                  const futuresRow = (
                    <tr key={`${account.id}-futures`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition bg-blue-50/30 dark:bg-blue-900/10">
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">⚡ FUTURES</span>
                      </td>
                      {futures ? (
                        <>
                          <td className="px-3 py-3 font-mono text-gray-600 dark:text-gray-300">${fmt(futures.initial_balance)}</td>
                          <td className="px-3 py-3 font-mono text-gray-900 dark:text-white font-semibold">${fmt(futures.equity)}</td>
                          <td className="px-3 py-3 font-mono text-blue-600 dark:text-blue-400">${fmt(futures.available_equity)}</td>
                          <td className="px-3 py-3 font-mono text-amber-600 dark:text-amber-400">${fmt(futures.margin_used)}</td>
                          <td className={`px-3 py-3 font-mono ${pnlCls(futures.unrealized_pnl)}`}>
                            {futures.unrealized_pnl >= 0 ? '+' : ''}{fmt(futures.unrealized_pnl)}
                          </td>
                          <td className={`px-3 py-3 font-mono ${pnlCls(futures.realized_pnl)}`}>
                            {futures.realized_pnl >= 0 ? '+' : ''}{fmt(futures.realized_pnl)}
                          </td>
                          <td className="px-3 py-3 font-mono text-gray-500">{fmt(futures.fee_total)}</td>
                        </>
                      ) : (
                        <td colSpan={7} className="px-3 py-3 text-xs text-gray-400 italic">Chưa seed FUTURES</td>
                      )}
                    </tr>
                  );

                  if (!hasBoth) {
                    return (
                      <tr key={account.id}>
                        <td className="px-3 py-3 font-medium text-gray-900 dark:text-white">{account.name}</td>
                        <td colSpan={10} className="px-3 py-3 text-xs text-gray-400 italic">Chưa seed balance</td>
                      </tr>
                    );
                  }

                  return (
                    <React.Fragment key={account.id}>
                      {spotRow}
                      {futuresRow}
                    </React.Fragment>
                  );
                })}
                {rows.length === 0 && (
                  <tr><td colSpan={11} className="px-4 py-8 text-center text-gray-400">Không có account nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
