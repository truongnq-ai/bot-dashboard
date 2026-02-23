'use client';

import React, { useEffect, useState } from 'react';
import { getOrders } from '@/lib/api/bot.service';
import type { Order } from '@/types/bot';

const STATUS_STYLES: Record<string, string> = {
  NEW: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  FILLED: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  CANCELED: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('NEW');
  const [limit, setLimit] = useState(50);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders({ status: statusFilter || undefined, limit });
      setOrders(data.orders);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, [statusFilter, limit]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
        <div className="flex items-center gap-2">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            <option value="">Tất cả</option>
            <option value="NEW">NEW</option>
            <option value="FILLED">FILLED</option>
            <option value="CANCELED">CANCELED</option>
          </select>
          <select value={limit} onChange={e => setLimit(Number(e.target.value))}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            {[25, 50, 100, 200].map(n => <option key={n} value={n}>{n} records</option>)}
          </select>
          <button onClick={loadOrders} className="text-sm px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 transition">
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
                  {['ID', 'Signal ID', 'Symbol', 'Side', 'Type', 'Price', 'Qty', 'Status', 'Filled @', 'Fee', 'Time'].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-3 py-2 font-mono text-gray-500 text-xs">{o.id}</td>
                    <td className="px-3 py-2 font-mono text-xs text-gray-500">{o.signal_id ?? '—'}</td>
                    <td className="px-3 py-2 font-medium">{o.symbol}</td>
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${o.side === 'BUY' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                        {o.side}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500">{o.order_type}</td>
                    <td className="px-3 py-2 font-mono text-xs">{o.price?.toFixed(4) ?? '—'}</td>
                    <td className="px-3 py-2 font-mono text-xs">{o.quantity}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[o.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{o.filled_price?.toFixed(4) ?? '—'}</td>
                    <td className="px-3 py-2 font-mono text-xs">{o.fee_usdt?.toFixed(4) ?? '—'}</td>
                    <td className="px-3 py-2 text-xs text-gray-400 whitespace-nowrap">
                      {o.timestamp ? new Date(o.timestamp).toLocaleString('vi-VN') : '—'}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={11} className="px-4 py-8 text-center text-gray-400">Không có order nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400">
            Hiển thị: {orders.length} orders
          </div>
        </div>
      )}
    </div>
  );
}
