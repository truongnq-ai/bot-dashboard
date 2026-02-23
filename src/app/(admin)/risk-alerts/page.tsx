'use client';

import React, { useEffect, useState } from 'react';
import { getDecayStatus, getStrategyStatus } from '@/lib/api/bot.service';

interface DecayPosition {
  account_id: number;
  symbol: string;
  side: string;
  decay_count: number;
  current_sl: number;
  current_tp: number;
  entry_price: number;
}

export default function RiskAlertsPage() {
  const [decayPositions, setDecayPositions] = useState<DecayPosition[]>([]);
  const [strategyEnabled, setStrategyEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [decay, status] = await Promise.all([
        getDecayStatus(),
        getStrategyStatus(),
      ]);
      setDecayPositions(
        Array.isArray(decay?.positions) ? decay.positions : []
      );
      setStrategyEnabled(status?.enabled ?? null);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Risk Alerts</h1>
        <button onClick={loadData} className="text-sm px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 transition">
          ↻ Refresh
        </button>
      </div>

      {/* Strategy stopped warning */}
      {strategyEnabled === false && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 px-4 py-3 text-red-700 dark:text-red-400 flex items-center gap-2">
          <span className="text-lg">🔴</span>
          <span className="font-semibold">Cảnh báo: Strategy đang TẮT. Bot không theo dõi thị trường.</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Đang tải...</div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">
              ⏬ Positions đang Decay SL/TP
            </h2>
            <p className="text-xs text-gray-400 mb-4">Các position đã bị decay — SL/TP đang co lại theo thời gian</p>

            {decayPositions.length === 0 ? (
              <div className="text-center py-6 text-green-600 dark:text-green-400 font-medium">
                ✓ Không có position nào đang decay
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      {['Account', 'Symbol', 'Side', 'Decay Count', 'Entry', 'SL hiện tại', 'TP hiện tại'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {decayPositions.map((p, i) => (
                      <tr key={i} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${p.decay_count > 5 ? 'bg-orange-50 dark:bg-orange-900/10' : ''}`}>
                        <td className="px-3 py-2 font-mono text-xs">{p.account_id}</td>
                        <td className="px-3 py-2 font-medium">{p.symbol}</td>
                        <td className="px-3 py-2">
                          <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${p.side === 'LONG' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                            {p.side}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span className={`font-bold font-mono text-sm ${p.decay_count > 5 ? 'text-orange-600' : 'text-yellow-600'}`}>
                            {p.decay_count}×
                          </span>
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">{p.entry_price?.toFixed(4)}</td>
                        <td className="px-3 py-2 font-mono text-xs text-red-500">{p.current_sl?.toFixed(4)}</td>
                        <td className="px-3 py-2 font-mono text-xs text-green-500">{p.current_tp?.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
