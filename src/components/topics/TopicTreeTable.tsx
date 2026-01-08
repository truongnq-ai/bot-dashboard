'use client';

import React from 'react';
import { Topic } from '@/types/topic';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import TopicTreeRow from './TopicTreeRow';

interface TopicTreeTableProps {
  topics: Topic[];
  onViewDetail?: (topic: Topic) => void;
  onEdit?: (topic: Topic) => void;
  onDelete?: (topic: Topic) => void;
}

export default function TopicTreeTable({
  topics,
  onViewDetail,
  onEdit,
  onDelete,
}: TopicTreeTableProps) {
  if (topics.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">Không có topic nào</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden overflow-y-visible rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto no-scrollbar">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Tên topic
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Mô tả
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Cấp độ
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Thứ tự
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {topics.map((topic) => (
                <TopicTreeRow
                  key={topic.id}
                  topic={topic}
                  onViewDetail={onViewDetail}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
