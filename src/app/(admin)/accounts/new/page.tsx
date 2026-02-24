'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAccount, getUsers } from '@/lib/api/bot.service';
import type { UserPublic } from '@/types/bot';

// ─── Default values (mirror config.py DEFAULT_*)
const TRADING_DEFAULTS: Record<string, string> = {
  TRADE_AMOUNT_USDT: '200',
  LEVERAGE: '10',
  OC_RATIO: 'null',
  MAX_OPEN_SIGNALS: '3',
  MAX_OPEN_POSITIONS: '3',
  TIME_FRAMES: '5m,15m',
};

const ADVANCED_DEFAULTS: Record<string, string> = {
  OC_PERCENTILE: '80',
  OC_LOOKBACK: '1000',
  TRIGGER_RATIO: '80.0',
  SL_OC_RATIO: '1.5',
  TP_OC_RATIO: '2.0',
  MIN_SL_OC_RATIO: '0.4',
  DECAY_RATE: '0.05',
  SL_OC_BUMP: '0.30',
  TP_OC_BUMP: '0.05',
  OC_MULTIPLIER_DECAY: '0.70',
  MAX_OC_MULTIPLIER: '2.0',
  MIN_VOLUME_USDT: '1000000',
};

const PARAM_LABELS: Record<string, { label: string; desc: string }> = {
  TRADE_AMOUNT_USDT:    { label: 'Vốn mỗi lệnh (USDT)',     desc: 'Số tiền USDT dùng cho mỗi lệnh vào' },
  LEVERAGE:             { label: 'Đòn bẩy (×)',              desc: 'Leverage sử dụng' },
  OC_RATIO:             { label: 'OC Ratio',                 desc: 'Hệ số OC. "null" = auto-chain tự động' },
  MAX_OPEN_SIGNALS:     { label: 'Max Signals đang mở',      desc: 'Số lượng signals ACTIVE tối đa đồng thời' },
  MAX_OPEN_POSITIONS:   { label: 'Max Positions đang mở',    desc: 'Số lượng positions OPEN tối đa đồng thời' },
  TIME_FRAMES:          { label: 'Time Frames',              desc: 'Khung thời gian, VD: 5m,15m. ⚠️ Cần restart bot khi thay đổi!' },
  OC_PERCENTILE:        { label: 'OC Percentile',            desc: 'Percentile để tính rolling OC' },
  OC_LOOKBACK:          { label: 'OC Lookback (nến)',        desc: 'Số nến lịch sử dùng tính OC' },
  TRIGGER_RATIO:        { label: 'Trigger Ratio (%)',        desc: 'Tỷ lệ % OC để kích hoạt lệnh' },
  SL_OC_RATIO:          { label: 'SL/OC Ratio',             desc: 'Tỷ lệ OC dùng tính Stop Loss' },
  TP_OC_RATIO:          { label: 'TP/OC Ratio',             desc: 'Tỷ lệ OC dùng tính Take Profit' },
  MIN_SL_OC_RATIO:      { label: 'Min SL/OC Ratio',         desc: 'Ngưỡng tối thiểu SL/OC sau decay' },
  DECAY_RATE:           { label: 'Decay Rate',              desc: 'Tốc độ thu hẹp SL/TP (%/phút × OC)' },
  SL_OC_BUMP:           { label: 'SL OC Bump',              desc: 'Bump thêm cho SL khi decay' },
  TP_OC_BUMP:           { label: 'TP OC Bump',              desc: 'Bump thêm cho TP khi decay' },
  OC_MULTIPLIER_DECAY:  { label: 'OC Multiplier Decay',     desc: 'Hệ số giảm OC Multiplier mỗi nến' },
  MAX_OC_MULTIPLIER:    { label: 'Max OC Multiplier',       desc: 'Giới hạn oc_multiplier tối đa' },
  MIN_VOLUME_USDT:      { label: 'Min Volume (USDT)',        desc: 'Volume 24h tối thiểu để trade symbol' },
};

export default function NewAccountPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserPublic[]>([]);

  // Cụm 1: Thông tin tài khoản
  const [name, setName] = useState('');
  const [userId, setUserId] = useState<number | ''>('');
  const [description, setDescription] = useState('');

  // Cụm 2a: Trading params
  const [tradingCfg, setTradingCfg] = useState<Record<string, string>>(TRADING_DEFAULTS);

  // Cụm 2b: Advanced params
  const [advancedCfg, setAdvancedCfg] = useState<Record<string, string>>(ADVANCED_DEFAULTS);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getUsers().then(d => setUsers(d.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Tên account là bắt buộc'); return; }

    const allConfigs: Record<string, string> = { ...tradingCfg, ...advancedCfg };

    try {
      setSubmitting(true);
      setError(null);
      const result = await createAccount({
        name: name.trim(),
        user_id: userId ? Number(userId) : undefined,
        description: description.trim() || undefined,
        configs: allConfigs,
      });
      router.push(`/accounts?created=${result.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tạo account';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent';
  const labelCls = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

  const renderField = (
    key: string,
    value: string,
    onChange: (v: string) => void,
  ) => {
    const meta = PARAM_LABELS[key];
    const isTimeFrames = key === 'TIME_FRAMES';
    return (
      <div key={key}>
        <label className={labelCls}>
          {meta?.label ?? key}
          {isTimeFrames && (
            <span className="ml-2 text-xs text-amber-500 font-normal">⚠️ Cần restart bot</span>
          )}
        </label>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className={inputCls}
        />
        {meta?.desc && <p className="mt-1 text-xs text-gray-400">{meta.desc}</p>}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push('/accounts')}
          className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
        >
          ← Accounts
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tạo Account mới</h1>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ──── Cụm 1: Thông tin tài khoản ──── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-blue-500">👤</span> Thông tin tài khoản
            </h2>
          </div>
          <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Tên Account <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Account_A"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Gắn với User</label>
              <select
                value={userId}
                onChange={e => setUserId(e.target.value ? Number(e.target.value) : '')}
                className={inputCls}
              >
                <option value="">— Không chọn —</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.full_name || u.email} (ID: {u.id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Mô tả</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Base - OC auto-chain"
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* ──── Cụm 2a: Cấu hình giao dịch ──── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-emerald-500">⚙️</span> Cấu hình giao dịch
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Các tham số quan trọng ảnh hưởng trực tiếp đến lệnh trade</p>
          </div>
          <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.keys(TRADING_DEFAULTS).map(key =>
              renderField(key, tradingCfg[key] ?? '', v =>
                setTradingCfg(prev => ({ ...prev, [key]: v }))
              )
            )}
          </div>
        </div>

        {/* ──── Cụm 2b: Cấu hình nâng cao ──── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAdvanced(v => !v)}
            className="w-full px-6 py-4 flex items-center justify-between text-left bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900/70 transition"
          >
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="text-purple-500">🔬</span> Cấu hình nâng cao
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">SL/TP ratio, Decay, OC tuning, Volume filter — thường dùng mặc định</p>
            </div>
            <span className="text-gray-400 text-lg">{showAdvanced ? '▲' : '▼'}</span>
          </button>

          {showAdvanced && (
            <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-700">
              {Object.keys(ADVANCED_DEFAULTS).map(key =>
                renderField(key, advancedCfg[key] ?? '', v =>
                  setAdvancedCfg(prev => ({ ...prev, [key]: v }))
                )
              )}
            </div>
          )}
        </div>

        {/* ──── Actions ──── */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => router.push('/accounts')}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition font-medium"
          >
            {submitting ? 'Đang tạo...' : '✓ Tạo Account'}
          </button>
        </div>
      </form>
    </div>
  );
}
