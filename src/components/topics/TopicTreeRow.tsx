'use client';

import React, { useState } from 'react';
import { Topic } from '@/types/topic';
import ActionsDropdown from '@/components/common/ActionsDropdown';
import { ActionItem } from '@/types/common';

interface TopicTreeRowProps {
  topic: Topic;
  level?: number;
  onViewDetail?: (topic: Topic) => void;
  onEdit?: (topic: Topic) => void;
  onDelete?: (topic: Topic) => void;
}

export default function TopicTreeRow({
  topic,
  level = 0,
  onViewDetail,
  onEdit,
  onDelete,
}: TopicTreeRowProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = topic.children && topic.children.length > 0;

  const getActions = (): ActionItem[] => {
    const actions: ActionItem[] = [];

    if (onViewDetail) {
      actions.push({
        id: 'view',
        label: 'Xem chi tiết',
        type: 'success',
        onClick: () => onViewDetail(topic),
      });
    }

    if (onEdit) {
      actions.push({
        id: 'edit',
        label: 'Sửa',
        type: 'info',
        onClick: () => onEdit(topic),
      });
    }

    if (onDelete) {
      actions.push({
        id: 'delete',
        label: 'Xóa',
        type: 'danger',
        onClick: () => onDelete(topic),
      });
    }

    return actions;
  };

  return (
    <>
      <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
        <td className="px-4 py-3">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
            {hasChildren ? (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {expanded ? (
                  <svg
                    className="w-4 h-4 text-gray-600 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 text-gray-600 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </button>
            ) : (
              <span className="w-6" />
            )}
            <span className="font-medium text-gray-900 dark:text-white">{topic.name}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
          {topic.description || '-'}
        </td>
        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
          {topic.level !== undefined ? topic.level : '-'}
        </td>
        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
          {topic.orderIndex !== undefined ? topic.orderIndex : '-'}
        </td>
        <td className="px-4 py-3">
          <ActionsDropdown actions={getActions()} />
        </td>
      </tr>
      {expanded &&
        hasChildren &&
        topic.children!.map((child) => (
          <TopicTreeRow
            key={child.id}
            topic={child}
            level={level + 1}
            onViewDetail={onViewDetail}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
    </>
  );
}

