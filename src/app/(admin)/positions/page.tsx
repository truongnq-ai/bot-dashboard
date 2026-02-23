'use client';

import React, { useEffect, useState } from 'react';
import { getPositions } from '@/lib/api/bot.service';
import type { Position } from '@/types/bot';

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('OPEN');
  const [limit, setLimit] = useState(50);

  const loadPositions = async () => {
    try {
      setLoading(true);
      const data = await getPositions({ status: statusFilter || undefined, limit });
      setPositions(data.positions);
    } catch {
      setPositions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPositions(); }, [statusFilter, limit]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Positions</h1>
        <div className="flex items-center gap-2">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            <option value="OPEN">OPEN</option>
            <option value="CLOSED">CLOSED</option>
            <option value="">Tất cả</option>
          </select>
          <select value={limit} onChange={e => setLimit(Number(e.target.value))}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            {[25, 50, 100, 200].map(n => <option key={n} value={n}>{n} records</option>)}
          </select>
          <button onClick={loadPositions} className="text-sm px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 transition">
            ↻ Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Đang tải...</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  {['ID', 'Acc', 'Symbol', 'TF', 'Side', 'Entry', 'Exit', 'SL', 'TP', 'PnL $', 'PnL %', 'Close Type', 'Status', 'Opened', 'Decay'].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {positions.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-3 py-2 font-mono text-gray-500 text-xs">{p.id}</td>
                    <td className="px-3 py-2 font-mono text-xs">{p.account_id}</td>
                    <td className="px-3 py-2 font-medium">{p.symbol}</td>
                    <td className="px-3 py-2 text-gray-500 text-xs">{p.time_frame}</td>
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${p.side === 'LONG' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                        {p.side}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{p.entry_price?.toFixed(4)}</td>
                    <td className="px-3 py-2 font-mono text-xs">{p.exit_price?.toFixed(4) ?? '—'}</td>
                    <td className="px-3 py-2 font-mono text-xs text-red-400">{p.sl_price?.toFixed(4) ?? '—'}</td>
                    <td className="px-3 py-2 font-mono text-xs text-green-400">{p.tp_price?.toFixed(4) ?? '—'}</td>
                    <td className={`px-3 py-2 font-mono text-xs font-semibold ${p.pnl_usd !== null ? (p.pnl_usd >= 0 ? 'text-green-600' : 'text-red-500') : ''}`}>
                      {p.pnl_usd !== null ? `${p.pnl_usd >= 0 ? '+' : ''}${p.pnl_usd.toFixed(2)}` : '—'}
                    </td>
                    <td className={`px-3 py-2 font-mono text-xs font-semibold ${p.pnl_percent !== null ? (p.pnl_percent >= 0 ? 'text-green-600' : 'text-red-500') : ''}`}>
                      {p.pnl_percent !== null ? `${p.pnl_percent >= 0 ? '+' : ''}${p.pnl_percent.toFixed(2)}%` : '—'}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-400">{p.close_type ?? '—'}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.status === 'OPEN'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>{p.status}</span>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-400 whitespace-nowrap">
                      {p.opened_at ? new Date(p.opened_at).toLocaleString('vi-VN') : '—'}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-gray-400">{p.decay_count ?? '—'}</td>
                  </tr>
                ))}
                {positions.length === 0 && (
                  <tr><td colSpan={15} className="px-4 py-8 text-center text-gray-400">Không có position nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400">
            Hiển thị: {positions.length} positions
          </div>
        </div>
      )}
    </div>
  );
}
