'use client';

import React from 'react';
import { Skill } from '@/types/skill';

interface SkillPrerequisitesBadgeProps {
  prerequisites: Skill[] | string[];
  maxDisplay?: number;
}

export default function SkillPrerequisitesBadge({
  prerequisites,
  maxDisplay = 3,
}: SkillPrerequisitesBadgeProps) {
  if (!prerequisites || prerequisites.length === 0) {
    return <span className="text-gray-400 dark:text-gray-500 text-sm">Không có</span>;
  }

  const displayItems = prerequisites.slice(0, maxDisplay);
  const remaining = prerequisites.length - maxDisplay;

  return (
    <div className="flex flex-wrap gap-1">
      {displayItems.map((prereq, index) => {
        const code = typeof prereq === 'string' ? prereq : prereq.code;
        const name = typeof prereq === 'string' ? prereq : prereq.name;
        return (
          <span
            key={index}
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
            title={name}
          >
            {code}
          </span>
        );
      })}
      {remaining > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-gray-500 dark:text-gray-400">
          +{remaining} more
        </span>
      )}
    </div>
  );
}

