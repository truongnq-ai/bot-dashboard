'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getStrategyStatus, getBackgroundTasksStatus, getPositions } from '@/lib/api/bot.service';
import type { StrategyStatus, Position } from '@/types/bot';
import Link from 'next/link';

/** Response thực tế từ GET /background-tasks/status */
interface BgTasksData {
  running: boolean;
  total_jobs: number;
  jobs: Array<{
    id: string;
    name: string;
    next_run_time: string;
  }>;
}

export default function DashboardPage() {
  const [strategy, setStrategy] = useState<StrategyStatus | null>(null);
  const [bgTasks, setBgTasks] = useState<BgTasksData | null>(null);
  const [openPositions, setOpenPositions] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [strategyData, bgData, positionsData] = await Promise.all([
        getStrategyStatus(),
        getBackgroundTasksStatus(),
        getPositions({ status: 'OPEN', limit: 200 }),
      ]);
      setStrategy(strategyData);

      // bgData có thể là { responseCode, responseMessage, data: {...} }
      // hoặc trực tiếp là { running, total_jobs, jobs }
      if (bgData?.data) {
        setBgTasks(bgData.data);
      } else if (bgData?.running !== undefined) {
        setBgTasks(bgData);
      }

      // positionsData trả về { count, positions } từ bot.service.ts
      if (positionsData?.positions) {
        setOpenPositions(positionsData.positions.length);
      } else if (typeof positionsData?.count === 'number') {
        setOpenPositions(positionsData.count);
      }

      setError(null);
    } catch (err) {
      setError('Không thể kết nối backend. Kiểm tra bot-core-service đang chạy.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 text-center">
        <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
        <button
          onClick={loadData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const strategyEnabled = strategy?.enabled ?? false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <button
          onClick={loadData}
          className="text-sm px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/60 transition"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Strategy Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Chiến thuật</p>
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${
                strategyEnabled ? 'bg-green-500 animate-pulse' : 'bg-red-400'
              }`}
            />
            <span className={`text-xl font-bold ${strategyEnabled ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
              {strategyEnabled ? 'ĐANG CHẠY' : 'TẮT'}
            </span>
          </div>
          <Link href="/config" className="text-xs text-blue-500 hover:underline mt-2 inline-block">
            Quản lý config →
          </Link>
        </div>

        {/* Open Positions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Vị thế đang mở</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{openPositions}</p>
          <Link href="/positions" className="text-xs text-blue-500 hover:underline mt-2 inline-block">
            Xem positions →
          </Link>
        </div>

        {/* Timestamp */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Cập nhật lần cuối</p>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {strategy?.timestamp ? new Date(strategy.timestamp).toLocaleTimeString('vi-VN') : '—'}
          </p>
          <p className="text-xs text-gray-400 mt-1">Tự động refresh 30s</p>
        </div>

        {/* Quick Links */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Truy cập nhanh</p>
          <div className="space-y-1">
            {[
              { href: '/signals', label: '📡 Signals' },
              { href: '/orders', label: '📋 Orders' },
              { href: '/accounts', label: '💼 Accounts' },
              { href: '/system-health', label: '🖥️ System Health' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="block text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Background Tasks — hiển thị đúng format: running, total_jobs, jobs[] */}
      {bgTasks && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">Background Tasks</h2>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
              bgTasks.running
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${bgTasks.running ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />
              {bgTasks.running ? 'Running' : 'Stopped'}
            </span>
            <span className="text-xs text-gray-400">{bgTasks.total_jobs} jobs</span>
          </div>

          {bgTasks.jobs && bgTasks.jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {bgTasks.jobs.map((job) => {
                const nextRun = new Date(job.next_run_time);
                const isUpcoming = nextRun > new Date();
                return (
                  <div
                    key={job.id}
                    className="rounded-lg p-3 border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{job.name}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {isUpcoming ? '⏱ Next:' : '⏱ Last:'} {nextRun.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Không có background jobs nào.</p>
          )}
        </div>
      )}
    </div>
  );
}
