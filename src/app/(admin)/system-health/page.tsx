'use client';

import React, { useEffect, useState } from 'react';
import { getStrategyStatus, getBackgroundTasksStatus, getOcState, getDecayStatus } from '@/lib/api/bot.service';
import type { StrategyStatus, OcState } from '@/types/bot';

export default function SystemHealthPage() {
  const [strategy, setStrategy] = useState<StrategyStatus | null>(null);
  const [bgTasks, setBgTasks] = useState<unknown>(null);
  const [ocState, setOcState] = useState<OcState | null>(null);
  const [decay, setDecay] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [s, bg, oc, d] = await Promise.all([
        getStrategyStatus(),
        getBackgroundTasksStatus(),
        getOcState(),
        getDecayStatus(),
      ]);
      setStrategy(s);
      setBgTasks(bg);
      setOcState(oc);
      setDecay(d);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const renderJson = (data: unknown) => (
    <pre className="text-xs bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
      {JSON.stringify(data, null, 2)}
    </pre>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Health</h1>
        <button onClick={loadAll} className="text-sm px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 transition">
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Đang tải...</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
              ⚙️ Strategy Status
              <span className={`ml-2 inline-block px-2 py-0.5 rounded-full text-xs ${
                strategy?.enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
              }`}>
                {strategy?.enabled ? 'RUNNING' : 'STOPPED'}
              </span>
            </h2>
            {renderJson(strategy)}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">🔄 Background Tasks</h2>
            {renderJson(bgTasks)}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">📊 OC State</h2>
            {renderJson(ocState)}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">⏬ SL/TP Decay Status</h2>
            {renderJson(decay)}
          </div>
        </div>
      )}
    </div>
  );
}
