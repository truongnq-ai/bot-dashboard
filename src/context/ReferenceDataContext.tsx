/**
 * Reference Data Context
 * Centralized store for subjects and topics with localStorage caching
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Subject, SubjectSearchParams } from '@/types/subject';
import { Topic, TopicSearchParams } from '@/types/topic';
import { getAllSubjects } from '@/lib/api/subject.service';
import { getAllTopics } from '@/lib/api/topic.service';
import {
    getCachedSubjects,
    getCachedTopics,
    getCacheVersion,
    setCachedSubjects,
    setCachedTopics,
    setCacheVersion,
    clearCache,
    isVersionValid,
    CURRENT_VERSION,
} from '@/lib/utils/reference-data-cache';

interface ReferenceDataContextType {
    subjects: Subject[];
    topics: Topic[];
    loading: boolean;
    loaded: boolean;
    init: () => Promise<void>;
    getSubjectName: (id: string) => string | undefined;
    getTopicName: (id: string) => string | undefined;
    getTopicsBySubjectId: (subjectId: string) => Topic[];
    getSubjectsByFilter: (params: SubjectSearchParams) => Subject[];
    getTopicsByFilter: (params: TopicSearchParams) => Topic[];
    buildTopicTree: (subjectId?: string) => Topic[];
}

const ReferenceDataContext = createContext<ReferenceDataContextType | undefined>(undefined);

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

export function ReferenceDataProvider({ children }: { children: React.ReactNode }) {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);

    /**
     * Initialize store: hydrate from cache or fetch from API
     */
    const init = useCallback(async () => {
        // Skip if already loaded
        if (loaded) {
            return;
        }

        setLoading(true);

        try {
            // Check version validity
            const versionValid = isVersionValid();
            const cachedSubjects = getCachedSubjects();
            const cachedTopics = getCachedTopics();

            // If version is valid and cache exists, use cache
            if (versionValid && cachedSubjects && cachedTopics) {
                setSubjects(cachedSubjects);
                setTopics(cachedTopics);
                setLoaded(true);
                setLoading(false);
                return;
            }

            // Version mismatch or cache missing - clear and fetch
            if (!versionValid) {
                clearCache();
            }

            // Fetch from API in parallel
            const [subjectsResponse, topicsResponse] = await Promise.all([
                getAllSubjects(),
                getAllTopics(),
            ]);

            // Handle subjects
            if (subjectsResponse.errorCode === '0000' && subjectsResponse.data) {
                setSubjects(subjectsResponse.data);
                setCachedSubjects(subjectsResponse.data);
            } else {
                console.warn('Failed to fetch subjects:', subjectsResponse.errorDetail);
            }

            // Handle topics
            if (topicsResponse.errorCode === '0000' && topicsResponse.data) {
                setTopics(topicsResponse.data);
                setCachedTopics(topicsResponse.data);
            } else {
                console.warn('Failed to fetch topics:', topicsResponse.errorDetail);
            }

            // Set version after successful cache
            setCacheVersion(CURRENT_VERSION);
            setLoaded(true);
        } catch (error) {
            console.warn('Failed to initialize reference data:', error);
        } finally {
            setLoading(false);
        }
    }, [loaded]);

    /**
     * Get subject name by ID
     */
    const getSubjectName = useCallback(
        (id: string): string | undefined => {
            const subject = subjects.find((s) => s.id === id);
            return subject?.name;
        },
        [subjects]
    );

    /**
     * Get topic name by ID
     */
    const getTopicName = useCallback(
        (id: string): string | undefined => {
            const topic = topics.find((t) => t.id === id);
            return topic?.name;
        },
        [topics]
    );

    /**
     * Get topics by subject ID
     */
    const getTopicsBySubjectId = useCallback(
        (subjectId: string): Topic[] => {
            return topics.filter((topic) => topic.subjectId === subjectId);
        },
        [topics]
    );

    /**
     * Get subjects by filter
     */
    const getSubjectsByFilter = useCallback(
        (params: SubjectSearchParams): Subject[] => {
            let filtered = subjects;

            if (params.name && params.name.trim() !== '') {
                const searchTerm = params.name.toLowerCase().trim();
                filtered = filtered.filter((subject) => subject.name.toLowerCase().includes(searchTerm));
            }

            return filtered;
        },
        [subjects]
    );

    /**
     * Get topics by filter
     */
    const getTopicsByFilter = useCallback(
        (params: TopicSearchParams): Topic[] => {
            let filtered = topics;

            if (params.subjectId) {
                filtered = filtered.filter((topic) => topic.subjectId === params.subjectId);
            }

            if (params.name && params.name.trim() !== '') {
                const searchTerm = params.name.toLowerCase().trim();
                filtered = filtered.filter((topic) => topic.name.toLowerCase().includes(searchTerm));
            }

            return filtered;
        },
        [topics]
    );

    /**
     * Build topic tree (optionally filtered by subjectId)
     */
    const buildTopicTreeMemoized = useCallback(
        (subjectId?: string): Topic[] => {
            let topicsToBuild = topics;
            if (subjectId) {
                topicsToBuild = topics.filter((topic) => topic.subjectId === subjectId);
            }
            return buildTopicTree(topicsToBuild);
        },
        [topics]
    );

    const value = useMemo(
        () => ({
            subjects,
            topics,
            loading,
            loaded,
            init,
            getSubjectName,
            getTopicName,
            getTopicsBySubjectId,
            getSubjectsByFilter,
            getTopicsByFilter,
            buildTopicTree: buildTopicTreeMemoized,
        }),
        [
            subjects,
            topics,
            loading,
            loaded,
            init,
            getSubjectName,
            getTopicName,
            getTopicsBySubjectId,
            getSubjectsByFilter,
            getTopicsByFilter,
            buildTopicTreeMemoized,
        ]
    );

    return <ReferenceDataContext.Provider value={value}>{children}</ReferenceDataContext.Provider>;
}

/**
 * Hook to access reference data context
 */
export function useReferenceData() {
    const context = useContext(ReferenceDataContext);
    if (context === undefined) {
        throw new Error('useReferenceData must be used within a ReferenceDataProvider');
    }
    return context;
}
