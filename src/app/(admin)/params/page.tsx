'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  getParams,
  createParam,
  updateParam,
  deleteParam,
  type SystemParam,
} from '@/lib/api/param.service';

// ─── Cờ notification group ─────────────────────────────────────────────────
const NOTIFICATION_FLAGS = [
  'NOTIFY_BOT_START',
  'NOTIFY_BOT_STOP',
  'NOTIFY_ACCOUNT_TOGGLE',
  'NOTIFY_NEW_ORDER',
  'NOTIFY_ORDER_EXPIRED',
  'NOTIFY_ENTRY_FILL',
  'NOTIFY_SL_HIT',
  'NOTIFY_TP_HIT',
  'NOTIFY_DECAY',
];

const isNotificationFlag = (group: string, code: string) =>
  group === 'NOTIFICATION' && NOTIFICATION_FLAGS.includes(code);

// ─── Add Param Modal ──────────────────────────────────────────────────────────
interface AddModalProps {
  onClose: () => void;
  onSaved: () => void;
}

function AddModal({ onClose, onSaved }: AddModalProps) {
  const [form, setForm] = useState({ group: '', code: '', value: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.group || !form.code || !form.value) {
      setError('Group, Code và Value là bắt buộc');
      return;
    }
    try {
      setSaving(true);
      await createParam({ group: form.group, code: form.code, value: form.value, description: form.description || undefined });
      onSaved();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e?.response?.data?.detail || 'Không thể tạo param');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Thêm tham số mới</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}
          {[
            { label: 'Group', key: 'group', placeholder: 'VD: NOTIFICATION' },
            { label: 'Code', key: 'code', placeholder: 'VD: NOTIFY_NEW_ORDER' },
            { label: 'Value', key: 'value', placeholder: 'VD: true' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
              <input
                type="text"
                value={form[key as keyof typeof form]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Mô tả (tuỳ chọn)</label>
            <input
              type="text"
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Mô tả tham số..."
              className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 pt-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              Huỷ
            </button>
            <button type="submit" disabled={saving} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
              {saving ? 'Đang lưu...' : 'Tạo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ParamsPage() {
  const [params, setParams] = useState<SystemParam[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterGroup, setFilterGroup] = useState('');
  const [editValues, setEditValues] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getParams(filterGroup || undefined);
      setParams(data.params);
      const initEdit: Record<number, string> = {};
      data.params.forEach(p => { initEdit[p.id] = p.value; });
      setEditValues(initEdit);
    } catch {
      setError('Không thể tải danh sách tham số');
    } finally {
      setLoading(false);
    }
  }, [filterGroup]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (p: SystemParam) => {
    const newVal = editValues[p.id];
    if (newVal === p.value) return;
    try {
      setSaving(p.id);
      await updateParam(p.id, { value: newVal });
      setParams(prev => prev.map(x => x.id === p.id ? { ...x, value: newVal } : x));
    } catch {
      alert('Không thể lưu');
    } finally {
      setSaving(null);
    }
  };

  const handleToggle = async (p: SystemParam) => {
    const newVal = p.value === 'true' ? 'false' : 'true';
    try {
      setSaving(p.id);
      await updateParam(p.id, { value: newVal });
      setParams(prev => prev.map(x => x.id === p.id ? { ...x, value: newVal } : x));
      setEditValues(prev => ({ ...prev, [p.id]: newVal }));
    } catch {
      alert('Không thể cập nhật');
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xác nhận xóa tham số này?')) return;
    try {
      setDeleting(id);
      await deleteParam(id);
      setParams(prev => prev.filter(p => p.id !== id));
    } catch {
      alert('Không thể xóa');
    } finally {
      setDeleting(null);
    }
  };

  // Group labels cho filter
  const groups = Array.from(new Set(params.map(p => p.group))).sort();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tham số hệ thống</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdd(true)}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Thêm
          </button>
          <button
            onClick={load}
            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Warning banner */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
        ⚠️ Thay đổi tham số nhóm <strong>NOTIFICATION</strong> có hiệu lực ngay — bot sẽ ngừng/tiếp tục gửi thông báo tương ứng mà không cần khởi động lại.
      </div>

      {/* Filter by group */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Group:</span>
        <button
          onClick={() => setFilterGroup('')}
          className={`px-2.5 py-1 text-xs rounded-full transition ${!filterGroup ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
        >
          Tất cả
        </button>
        {groups.map(g => (
          <button
            key={g}
            onClick={() => setFilterGroup(g === filterGroup ? '' : g)}
            className={`px-2.5 py-1 text-xs rounded-full transition ${filterGroup === g ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Đang tải...</div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  {['Group', 'Code', 'Giá trị / Trạng thái', 'Mô tả', 'Thao tác'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {params.map(p => {
                  const isFlag = isNotificationFlag(p.group, p.code);
                  const isEnabled = p.value === 'true';
                  const isDirty = editValues[p.id] !== p.value;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      {/* Group */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                          p.group === 'NOTIFICATION'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {p.group}
                        </span>
                      </td>

                      {/* Code */}
                      <td className="px-4 py-3 font-mono text-xs font-medium text-blue-700 dark:text-blue-400">
                        {p.code}
                      </td>

                      {/* Value / Toggle */}
                      <td className="px-4 py-3">
                        {isFlag ? (
                          /* Toggle switch cho notification flags */
                          <button
                            onClick={() => handleToggle(p)}
                            disabled={saving === p.id}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
                              isEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                            title={isEnabled ? 'Đang bật — click để tắt' : 'Đang tắt — click để bật'}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                isEnabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        ) : (
                          /* Text input cho param thường */
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editValues[p.id] ?? p.value}
                              onChange={e => setEditValues(prev => ({ ...prev, [p.id]: e.target.value }))}
                              className="w-40 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            {isDirty && (
                              <button
                                onClick={() => handleSave(p)}
                                disabled={saving === p.id}
                                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition"
                              >
                                {saving === p.id ? '...' : 'Lưu'}
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Description */}
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {p.description || '—'}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deleting === p.id}
                          className="px-2.5 py-1 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition"
                        >
                          {deleting === p.id ? '...' : 'Xóa'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {params.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      Không có tham số nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && <AddModal onClose={() => setShowAdd(false)} onSaved={load} />}
    </div>
  );
}
