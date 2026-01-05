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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell className="font-semibold">Tên topic</TableCell>
            <TableCell className="font-semibold">Mô tả</TableCell>
            <TableCell className="font-semibold">Cấp độ</TableCell>
            <TableCell className="font-semibold">Thứ tự</TableCell>
            <TableCell className="font-semibold">Thao tác</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
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
  );
}

