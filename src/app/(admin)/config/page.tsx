'use client';

import React, { useEffect, useState } from 'react';
import { getStrategyConfig, updateStrategyConfig } from '@/lib/api/bot.service';

interface ConfigParam {
  code: string;
  value: string;
}

export default function ConfigPage() {
  const [params, setParams] = useState<ConfigParam[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await getStrategyConfig();
      const list = Object.entries(data.config || {}).map(([code, value]) => ({ code, value }));
      setParams(list);
      const initEdit: Record<string, string> = {};
      list.forEach(p => { initEdit[p.code] = p.value; });
      setEditValues(initEdit);
    } catch {
      setParams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadConfig(); }, []);

  const handleSave = async (code: string) => {
    try {
      setSaving(code);
      await updateStrategyConfig(code, editValues[code]);
      setParams(prev => prev.map(p => p.code === code ? { ...p, value: editValues[code] } : p));
      alert(`Đã lưu: ${code} = ${editValues[code]}`);
    } catch {
      alert('Không thể lưu config');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cấu hình Strategy</h1>
        <button onClick={loadConfig} className="text-sm px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 transition">
          ↻ Refresh
        </button>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
        ⚠️ Thay đổi config sẽ có hiệu lực ngay lập tức. Kiểm tra kỹ trước khi lưu.
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Đang tải...</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  {['Tham số (code)', 'Giá trị hiện tại', 'Chỉnh sửa', 'Lưu'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {params.map(p => (
                  <tr key={p.code} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-blue-700 dark:text-blue-400">{p.code}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">{p.value}</td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={editValues[p.code] ?? p.value}
                        onChange={e => setEditValues(prev => ({ ...prev, [p.code]: e.target.value }))}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleSave(p.code)}
                        disabled={saving === p.code || editValues[p.code] === p.value}
                        className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {saving === p.code ? '...' : 'Lưu'}
                      </button>
                    </td>
                  </tr>
                ))}
                {params.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Không có cấu hình nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
