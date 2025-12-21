'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ActionItem } from '@/types/common';

interface ActionsDropdownProps {
  actions: ActionItem[];
  trigger?: React.ReactNode;
}

const actionColors = {
  success: {
    bg: 'bg-green-500',
    hover: 'hover:bg-green-600',
    text: 'text-green-700',
    border: 'border-green-500',
  },
  warning: {
    bg: 'bg-yellow-500',
    hover: 'hover:bg-yellow-600',
    text: 'text-yellow-700',
    border: 'border-yellow-500',
  },
  danger: {
    bg: 'bg-red-500',
    hover: 'hover:bg-red-600',
    text: 'text-red-700',
    border: 'border-red-500',
  },
  info: {
    bg: 'bg-blue-500',
    hover: 'hover:bg-blue-600',
    text: 'text-blue-700',
    border: 'border-blue-500',
  },
};

export default function ActionsDropdown({ actions, trigger }: ActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredActionId, setHoveredActionId] = useState<string | null>(null);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownWidth = 160; // min-w-[160px]
      const spacing = 8; // mt-2 = 8px
      
      // Calculate position
      let top = rect.bottom + window.scrollY + spacing;
      let right = window.innerWidth - rect.right + window.scrollX;
      
      // Adjust if dropdown would go off screen
      if (right < 0) {
        right = window.innerWidth - rect.left + window.scrollX - dropdownWidth;
      }
      
      // Adjust if dropdown would go below viewport
      const viewportHeight = window.innerHeight;
      const dropdownHeight = actions.length * 40 + 8; // Approximate height
      if (rect.bottom + dropdownHeight > viewportHeight) {
        // Show above trigger instead
        top = rect.top + window.scrollY - dropdownHeight - spacing;
      }
      
      setPosition({ top, right });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('.actions-dropdown-toggle') &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      updatePosition();
      
      const handleResize = () => updatePosition();
      const handleScroll = () => updatePosition();
      
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isOpen]);

  const handleActionClick = (action: ActionItem) => {
    if (!action.disabled) {
      action.onClick();
      setIsOpen(false);
    }
  };

  const defaultTrigger = (
    <button
      className="actions-dropdown-toggle flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
      onClick={() => setIsOpen(!isOpen)}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
        />
      </svg>
    </button>
  );

  const dropdownContent = isOpen && mounted ? (
    createPortal(
      <div
        ref={dropdownRef}
        className="fixed z-50 rounded-xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
        style={{
          top: `${position.top}px`,
          right: `${position.right}px`,
        }}
      >
        <div className="py-1 min-w-[160px]">
          {actions.map((action) => {
            const colors = actionColors[action.type];
            const isHovered = hoveredActionId === action.id;

            return (
              <button
                key={action.id}
                onClick={() => handleActionClick(action)}
                onMouseEnter={() => setHoveredActionId(action.id)}
                onMouseLeave={() => setHoveredActionId(null)}
                disabled={action.disabled}
                className={`
                  relative block w-full text-left px-4 py-2.5 text-sm
                  ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  ${colors.text} dark:text-gray-300
                  overflow-hidden
                  transition-colors duration-200
                  ${!action.disabled ? 'hover:bg-gray-50 dark:hover:bg-white/[0.05]' : ''}
                `}
              >
                {/* Animated color bar */}
                <span
                  className={`
                    absolute bottom-0 left-0 h-0.5 ${colors.bg}
                    transition-all duration-500 ease-in-out
                    ${isHovered ? 'w-full' : 'w-0'}
                  `}
                />

                <div className="flex items-center gap-2">
                  {action.icon && <span className="flex-shrink-0">{action.icon}</span>}
                  <span>{action.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>,
      document.body
    )
  ) : null;

  return (
    <div ref={triggerRef} className="relative">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger || defaultTrigger}</div>
      {dropdownContent}
    </div>
  );
}

