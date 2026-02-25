'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getOcStates, updateOcState, deleteOcState } from '@/lib/api/bot.service';
import type { OcStateItem } from '@/lib/api/bot.service';

const multColor = (m: number) => {
  if (m >= 1.8) return 'text-red-600 dark:text-red-400';
  if (m >= 1.3) return 'text-amber-600 dark:text-amber-400';
  if (m > 1.0) return 'text-yellow-500 dark:text-yellow-400';
  return 'text-gray-400';
};

export default function OcStatesPage() {
  const [data, setData] = useState<OcStateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inline edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getOcStates();
      setData(res.oc_states);
      setError(null);
    } catch {
      setError('Không thể tải danh sách OC States');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleEdit = (row: OcStateItem) => {
    setEditingId(row.id);
    setEditValue(String(row.oc_multiplier));
  };

  const handleSave = async (row: OcStateItem) => {
    const val = parseFloat(editValue);
    if (isNaN(val) || val < 1.0) {
      alert('Giá trị không hợp lệ (tối thiểu 1.0)');
      return;
    }
    setSaving(true);
    try {
      await updateOcState(row.id, val);
      setData(prev => prev.map(r => r.id === row.id ? { ...r, oc_multiplier: val } : r));
      setEditingId(null);
    } catch {
      alert('Không thể cập nhật. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: OcStateItem) => {
    if (!confirm(`Xóa OC State ${row.symbol}/${row.time_frame} của ${row.account_name}?\nMultiplier sẽ về 1.0x ngay lập tức.`)) return;
    setDeletingId(row.id);
    try {
      await deleteOcState(row.id);
      setData(prev => prev.filter(r => r.id !== row.id));
    } catch {
      alert('Không thể xóa. Vui lòng thử lại.');
    } finally {
      setDeletingId(null);
    }
  };

  const fmt = (iso: string | null) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      return d.toLocaleString('vi-VN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch { return iso; }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">⚡ OC States</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Adaptive OC Multiplier đang active — sinh tự động qua SL/TP fill
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
        >
          {loading ? '⏳' : '↻'} Refresh
        </button>
      </div>

      {/* Info callout */}
      <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
        <strong>OC State</strong> ghi nhớ mức độ cẩn thận của bot sau SL/TP. Multiplier &gt; 1.0x = vị thế tiếp theo đòi giá vào sâu hơn. Xóa 1 row để reset cặp đó về 1.0x.
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Đang tải...</div>
        ) : data.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Không có OC State nào đang active</p>
            <p className="text-xs text-gray-400 mt-1">Tất cả multiplier đang ở 1.0x (bình thường)</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <th className="px-4 py-3 text-left font-medium">ID</th>
                  <th className="px-4 py-3 text-left font-medium">Account</th>
                  <th className="px-4 py-3 text-left font-medium">Symbol</th>
                  <th className="px-4 py-3 text-left font-medium">TF</th>
                  <th className="px-4 py-3 text-right font-medium">OC Multiplier</th>
                  <th className="px-4 py-3 text-right font-medium">Updated At</th>
                  <th className="px-4 py-3 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {data.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">#{row.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{row.account_name}</td>
                    <td className="px-4 py-3 font-mono font-medium text-gray-900 dark:text-white">{row.symbol}</td>
                    <td className="px-4 py-3">
                      <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs font-mono text-gray-600 dark:text-gray-300">
                        {row.time_frame}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {editingId === row.id ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <input
                            type="number"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            step="0.05"
                            min="1.0"
                            max="10.0"
                            className="w-24 px-2 py-1 text-sm text-right rounded border border-blue-400 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                            autoFocus
                            onKeyDown={e => { if (e.key === 'Enter') handleSave(row); if (e.key === 'Escape') setEditingId(null); }}
                          />
                          <button
                            onClick={() => handleSave(row)}
                            disabled={saving}
                            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            {saving ? '...' : '✓'}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(row)}
                          className="group flex items-center gap-1 ml-auto hover:opacity-80 transition"
                        >
                          <span className={`font-mono font-bold text-sm ${multColor(row.oc_multiplier)}`}>
                            ×{row.oc_multiplier.toFixed(2)}
                          </span>
                          <span className="opacity-0 group-hover:opacity-100 text-xs text-gray-400 transition">✏️</span>
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {fmt(row.updated_at)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(row)}
                        disabled={deletingId === row.id}
                        className="px-2.5 py-1 text-xs rounded bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition disabled:opacity-50"
                        title="Xóa — Reset về 1.0x"
                      >
                        {deletingId === row.id ? '⏳' : '✕ Reset'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
              <p className="text-xs text-gray-400">{data.length} OC State đang active | Click vào Multiplier để sửa | ✕ Reset về 1.0x</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
