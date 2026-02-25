'use client';

import React, { useEffect, useState } from 'react';
import { getSignals } from '@/lib/api/bot.service';
import { useAuth } from '@/context/AuthContext';
import type { Signal } from '@/types/bot';

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  CLOSED: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  CANCELED: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
};

export default function SignalsPage() {
  const { getAccountName } = useAuth();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [limit, setLimit] = useState(50);

  const loadSignals = async () => {
    try {
      setLoading(true);
      const data = await getSignals({ status: statusFilter || undefined, limit });
      setSignals(data.signals);
    } catch {
      setSignals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSignals(); }, [statusFilter, limit]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Signals</h1>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            <option value="">Tất cả</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="CLOSED">CLOSED</option>
            <option value="CANCELED">CANCELED</option>
          </select>
          <select
            value={limit}
            onChange={e => setLimit(Number(e.target.value))}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            {[25, 50, 100, 200].map(n => <option key={n} value={n}>{n} records</option>)}
          </select>
          <button onClick={loadSignals} className="text-sm px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 transition">
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
                  {['ID', 'Account', 'Symbol', 'TF', 'Side', 'Entry', 'SL', 'TP', 'OC%', 'Status', 'Reason', 'Time'].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {signals.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-3 py-2 font-mono text-gray-500 text-xs">{s.id}</td>
                    <td className="px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300">{getAccountName(s.account_id)}</td>
                    <td className="px-3 py-2 font-medium">{s.symbol}</td>
                    <td className="px-3 py-2 text-gray-500">{s.time_frame}</td>
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${s.side === 'BUY' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                        {s.side}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{s.entry_price?.toFixed(4)}</td>
                    <td className="px-3 py-2 font-mono text-xs text-red-500">{s.sl?.toFixed(4)}</td>
                    <td className="px-3 py-2 font-mono text-xs text-green-500">{s.tp?.toFixed(4)}</td>
                    <td className="px-3 py-2 font-mono text-xs">{s.oc_percent?.toFixed(2) ?? '—'}%</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[s.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-400 max-w-[100px] truncate">{s.closed_reason ?? '—'}</td>
                    <td className="px-3 py-2 text-xs text-gray-400 whitespace-nowrap">
                      {s.timestamp ? new Date(s.timestamp).toLocaleString('vi-VN') : '—'}
                    </td>
                  </tr>
                ))}
                {signals.length === 0 && (
                  <tr><td colSpan={12} className="px-4 py-8 text-center text-gray-400">Không có signal nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400">
            Hiển thị: {signals.length} signals
          </div>
        </div>
      )}
    </div>
  );
}
