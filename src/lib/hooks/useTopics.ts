/**
 * Topic Hooks
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Topic, TopicSearchParams } from '@/types/topic';
import { getAllTopics, getTopicById } from '@/lib/api/topic.service';

/**
 * Build tree structure from flat list
 */
function buildTopicTree(flatList: Topic[]): Topic[] {
  const map = new Map<string, Topic>();
  const roots: Topic[] = [];

  // Create map with empty children arrays
  flatList.forEach((topic) => {
    map.set(topic.id, { ...topic, children: [] });
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
  const sortChildren = (nodes: Topic[]): Topic[] => {
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
 * Hook to fetch all topics with client-side filtering
 */
export function useTopics(searchParams: TopicSearchParams = {}) {
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all topics once
  const fetchTopics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllTopics(searchParams.subjectId);
      if (response.errorCode === '0000' && response.data) {
        setAllTopics(response.data);
      } else {
        setError(new Error(response.errorDetail || 'Failed to fetch topics'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch topics'));
    } finally {
      setLoading(false);
    }
  }, [searchParams.subjectId]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  // Client-side filtering
  const filteredTopics = useMemo(() => {
    let filtered = allTopics;

    // Filter by name if provided
    if (searchParams.name && searchParams.name.trim() !== '') {
      const searchTerm = searchParams.name.toLowerCase().trim();
      filtered = filtered.filter((topic) => topic.name.toLowerCase().includes(searchTerm));
    }

    return filtered;
  }, [allTopics, searchParams.name]);

  return {
    data: filteredTopics,
    loading,
    error,
    refetch: fetchTopics,
    totalElements: filteredTopics.length,
  };
}

/**
 * Hook to fetch topics and build tree structure
 */
export function useTopicsTree(subjectId?: string) {
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all topics once
  const fetchTopics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllTopics(subjectId);
      if (response.errorCode === '0000' && response.data) {
        setAllTopics(response.data);
      } else {
        setError(new Error(response.errorDetail || 'Failed to fetch topics'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch topics'));
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  // Build tree structure
  const treeData = useMemo(() => {
    return buildTopicTree(allTopics);
  }, [allTopics]);

  return {
    data: treeData,
    flatData: allTopics,
    loading,
    error,
    refetch: fetchTopics,
    totalElements: allTopics.length,
  };
}

/**
 * Hook to fetch single topic by ID
 */
export function useTopic(id: string | null) {
  const [data, setData] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchTopic = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getTopicById(id);
        if (response.errorCode === '0000' && response.data) {
          setData(response.data);
        } else {
          setError(new Error(response.errorDetail || 'Failed to fetch topic'));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch topic'));
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [id]);

  return { data, loading, error };
}

