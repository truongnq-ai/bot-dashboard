'use client';

import React from 'react';
import { Skill } from '@/types/skill';

interface SkillPrerequisitesBadgeProps {
  prerequisites?: Skill[] | string[];
  prerequisiteNames?: string[];
  maxDisplay?: number;
}

export default function SkillPrerequisitesBadge({
  prerequisites,
  prerequisiteNames,
  maxDisplay = 3,
}: SkillPrerequisitesBadgeProps) {
  // Use prerequisiteNames if available (from backend), otherwise fallback to prerequisites
  const names = prerequisiteNames || (prerequisites?.map(p => typeof p === 'string' ? p : p.name) || []);
  
  if (!names || names.length === 0) {
    return <span className="text-gray-400 dark:text-gray-500 text-sm">Không có</span>;
  }

  const displayItems = names.slice(0, maxDisplay);
  const remaining = names.length - maxDisplay;

  return (
    <div className="flex flex-wrap gap-1">
      {displayItems.map((name, index) => (
        <span
          key={index}
          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
          title={name}
        >
          {name}
        </span>
      ))}
      {remaining > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-gray-500 dark:text-gray-400">
          +{remaining} more
        </span>
      )}
    </div>
  );
}

