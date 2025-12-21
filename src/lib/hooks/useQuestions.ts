/**
 * Question Hooks
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Question,
  QuestionSearchParams,
  QuestionStatsResponse,
} from '@/types/question';
import { PageResponse } from '@/types/common';
import {
  getQuestions,
  getQuestionById,
  getQuestionStats,
  getQuestionsByExercise,
  getQuestionsBySkill,
} from '@/lib/api/question.service';

/**
 * Hook to fetch questions list with pagination
 */
export function useQuestions(searchParams: QuestionSearchParams = {}) {
  const [data, setData] = useState<PageResponse<Question> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getQuestions(searchParams);
      if (response.data) {
        setData(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch questions'));
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return { data, loading, error, refetch: fetchQuestions };
}

/**
 * Hook to fetch single question by ID
 */
export function useQuestion(id: string | null) {
  const [data, setData] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchQuestion = useCallback(async () => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getQuestionById(id);
      if (response.data) {
        setData(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch question'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  return { data, loading, error, refetch: fetchQuestion };
}

/**
 * Hook to fetch question statistics
 */
export function useQuestionStats(id: string | null) {
  const [data, setData] = useState<QuestionStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getQuestionStats(id);
      if (response.data) {
        setData(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch question stats'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
}

/**
 * Hook to fetch questions by exercise
 */
export function useQuestionsByExercise(exerciseId: string | null) {
  const [data, setData] = useState<Question[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchQuestions = useCallback(async () => {
    if (!exerciseId) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getQuestionsByExercise(exerciseId);
      if (response.data) {
        setData(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch questions'));
    } finally {
      setLoading(false);
    }
  }, [exerciseId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return { data, loading, error, refetch: fetchQuestions };
}

/**
 * Hook to fetch questions by skill
 */
export function useQuestionsBySkill(skillId: string | null) {
  const [data, setData] = useState<Question[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchQuestions = useCallback(async () => {
    if (!skillId) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getQuestionsBySkill(skillId);
      if (response.data) {
        setData(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch questions'));
    } finally {
      setLoading(false);
    }
  }, [skillId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return { data, loading, error, refetch: fetchQuestions };
}

