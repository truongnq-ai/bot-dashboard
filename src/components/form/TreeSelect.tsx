/**
 * TreeSelect Component - Custom tree select with Tailwind CSS styling
 * Compatible with React 19, no external dependencies
 */

'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Topic } from '@/types/topic';

interface TopicTreeSelectProps {
    value?: string;
    onChange?: (value: string) => void;
    treeData: Topic[];
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    error?: boolean;
}

interface TreeNode extends Topic {
    children?: TreeNode[];
    expanded?: boolean;
}

/**
 * Build tree structure from flat list
 */
function buildTreeFromFlatList(flatList: Topic[]): TreeNode[] {
    const map = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    // Create map with empty children arrays
    flatList.forEach((topic) => {
        map.set(topic.id, { ...topic, children: [], expanded: false });
    });

    // Build tree
    flatList.forEach((topic) => {
        const node = map.get(topic.id)!;
        if (topic.parentId) {
            const parent = map.get(topic.parentId);
            if (parent) {
                parent.children = parent.children || [];
                parent.children.push(node);
            }
        } else {
            roots.push(node);
        }
    });

    // Sort children by orderIndex
    const sortChildren = (nodes: TreeNode[]): TreeNode[] => {
        return nodes
            .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
            .map((node) => ({
                ...node,
                children: node.children ? sortChildren(node.children) : [],
            }));
    };

    return sortChildren(roots);
}

/**
 * Find node by value in tree
 */
function findNodeByValue(nodes: TreeNode[], value: string): TreeNode | null {
    for (const node of nodes) {
        if (node.id === value) {
            return node;
        }
        if (node.children) {
            const found = findNodeByValue(node.children, value);
            if (found) return found;
        }
    }
    return null;
}

/**
 * Get full path of node (for display)
 */
function getNodePath(nodes: TreeNode[], value: string, path: string[] = []): string[] | null {
    for (const node of nodes) {
        const currentPath = [...path, node.name];
        if (node.id === value) {
            return currentPath;
        }
        if (node.children) {
            const found = getNodePath(node.children, value, currentPath);
            if (found) return found;
        }
    }
    return null;
}

export default function TopicTreeSelect({
    value,
    onChange,
    treeData,
    placeholder = 'Chọn chủ đề',
    disabled = false,
    className = '',
    error = false,
}: TopicTreeSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Build tree structure
    const tree = useMemo(() => {
        if (!treeData || treeData.length === 0) return [];
        return buildTreeFromFlatList(treeData);
    }, [treeData]);

    // Get selected node
    const selectedNode = useMemo(() => {
        if (!value) return null;
        return findNodeByValue(tree, value);
    }, [value, tree]);

    // Get display text
    const displayText = useMemo(() => {
        if (selectedNode) {
            return selectedNode.name;
        }
        return placeholder;
    }, [selectedNode, placeholder]);

    // Filter tree based on search
    const filterTree = (nodes: TreeNode[], term: string): TreeNode[] => {
        if (!term) return nodes;

        const filtered: TreeNode[] = [];
        nodes.forEach((node) => {
            const matchesSearch = node.name.toLowerCase().includes(term.toLowerCase());
            const filteredChildren = node.children ? filterTree(node.children, term) : [];

            if (matchesSearch || filteredChildren.length > 0) {
                filtered.push({
                    ...node,
                    children: filteredChildren.length > 0 ? filteredChildren : node.children,
                });
            }
        });
        return filtered;
    };

    const filteredTree = useMemo(() => {
        return filterTree(tree, searchTerm);
    }, [tree, searchTerm]);

    // Toggle expand/collapse
    const toggleExpand = (nodeId: string) => {
        setExpandedNodes((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) {
                newSet.delete(nodeId);
            } else {
                newSet.add(nodeId);
            }
            return newSet;
        });
    };

    // Handle node selection
    const handleSelect = (node: TreeNode) => {
        onChange?.(node.id);
        setIsOpen(false);
        setSearchTerm('');
    };

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
    }, [isOpen]);

    // Render tree node
    const renderTreeNode = (node: TreeNode, level: number = 0): React.ReactNode => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedNodes.has(node.id);
        const isSelected = value === node.id;
        const indent = level * 20;

        return (
            <div key={node.id}>
                <div
                    className={`flex items-center px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer ${isSelected ? 'bg-brand-50 dark:bg-brand-900/20' : ''
                        }`}
                    style={{ paddingLeft: `${indent + 8}px` }}
                    onClick={() => handleSelect(node)}
                >
                    {hasChildren && (
                        <button
                            type="button"
                            className="mr-2 w-4 h-4 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(node.id);
                            }}
                        >
                            <span className={`text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                                ▶
                            </span>
                        </button>
                    )}
                    {!hasChildren && <span className="mr-2 w-4" />}
                    <span className={`text-theme-sm ${isSelected ? 'font-medium text-brand-600 dark:text-brand-400' : 'text-gray-900 dark:text-white'}`}>
                        {node.name}
                    </span>
                </div>
                {hasChildren && isExpanded && (
                    <div>{node.children!.map((child) => renderTreeNode(child, level + 1))}</div>
                )}
            </div>
        );
    };

    return (
        <div className={`relative w-full ${className}`} ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full px-3 py-2 text-left border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors ${error
                        ? 'border-error-500'
                        : 'border-gray-300 dark:border-gray-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
                    } ${disabled
                        ? 'bg-gray-100 dark:bg-gray-900 cursor-not-allowed opacity-50'
                        : 'hover:border-gray-400 dark:hover:border-gray-500'
                    } ${!selectedNode ? 'text-gray-400 dark:text-gray-400' : ''
                    }`}
            >
                <div className="flex items-center justify-between">
                    <span className="truncate flex-1 text-theme-sm">{displayText}</span>
                    <span className="ml-2 text-gray-500 dark:text-gray-400">
                        {isOpen ? '▲' : '▼'}
                    </span>
                </div>
            </button>

            {/* Dropdown */}
            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-hidden flex flex-col">
                    {/* Search Input */}
                    {tree.length > 0 && (
                        <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm kiếm..."
                                className="w-full px-2 py-1.5 text-theme-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    )}

                    {/* Tree List */}
                    <div className="overflow-y-auto max-h-64">
                        {filteredTree.length === 0 ? (
                            <div className="px-4 py-3 text-theme-sm text-gray-500 dark:text-gray-400 text-center">
                                {searchTerm ? 'Không tìm thấy chủ đề' : 'Không có chủ đề'}
                            </div>
                        ) : (
                            <div className="py-1">
                                {filteredTree.map((node) => renderTreeNode(node))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
