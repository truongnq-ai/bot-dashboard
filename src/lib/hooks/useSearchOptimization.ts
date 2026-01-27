import { useState, useEffect } from 'react';

interface UseSearchOptimizationOptions {
  initialValue?: string;
  minLength?: number;
  delay?: number;
}

interface UseSearchOptimizationResult {
  /** The current value of the input field (realtime) */
  input: string;
  /** Setter for the input field */
  setInput: (value: string) => void;
  /** The debounced value to be used for API calls. Returns undefined if length < minLength */
  debouncedValue: string | undefined;
  /** Helper to trigger search immediately (e.g., on Enter) - bypasses debounce but checks minLength */
  triggerSearch: () => void;
  /** Boolean indicating if we are in the debounce waiting period */
  isTyping: boolean;
}

/**
 * Custom hook for optimized text search
 * - Debounces input (default 500ms)
 * - Enforces minimum length (default 3 chars)
 * - Returns undefined if constraints are not met
 */
export function useSearchOptimization({
  initialValue = '',
  minLength = 3,
  delay = 500,
}: UseSearchOptimizationOptions = {}): UseSearchOptimizationResult {
  const [input, setInput] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<string | undefined>(
    initialValue && initialValue.trim().length >= minLength ? initialValue : undefined
  );
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // If input matches current debounced value (or both effectively empty/short), do nothing
    const trimmed = input.trim();
    if (trimmed === debouncedValue) {
      const t = setTimeout(() => setIsTyping(false), 0);
      return () => clearTimeout(t);
    }

    const tStart = setTimeout(() => setIsTyping(true), 0);
    const handler = setTimeout(() => {
      if (trimmed.length >= minLength) {
        setDebouncedValue(trimmed);
      } else {
        // If length < minLength, we treat it as "no search" / empty
        setDebouncedValue(undefined);
      }
      setIsTyping(false);
    }, delay);

    return () => {
      clearTimeout(tStart);
      clearTimeout(handler);
    };
  }, [input, delay, minLength, debouncedValue]);

  const triggerSearch = () => {
    const trimmed = input.trim();
    if (trimmed.length >= minLength) {
      setDebouncedValue(trimmed);
    } else {
      setDebouncedValue(undefined);
    }
    setIsTyping(false);
  };

  return {
    input,
    setInput,
    debouncedValue,
    triggerSearch,
    isTyping,
  };
}
