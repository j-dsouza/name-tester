import { useState, useCallback } from 'react';

interface RetryOptions {
  maxRetries?: number;
  timeoutMs?: number;
  warmupDelayMs?: number;
}

interface RetryState {
  isLoading: boolean;
  isWarmingUp: boolean;
  retryCount: number;
  error: string;
}

interface RetryActions {
  execute: (apiCall: () => Promise<Response>) => Promise<any>;
  reset: () => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  timeoutMs: 30000,
  warmupDelayMs: 3000,
};

export function useRetryWithWarmup(options: RetryOptions = {}): RetryState & RetryActions {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  const [isLoading, setIsLoading] = useState(false);
  const [isWarmingUp, setIsWarmingUp] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string>('');

  const calculateDelay = (attempt: number): number => {
    return Math.min(8000 * Math.pow(1.5, attempt - 1), 15000);
  };

  const executeWithRetry = useCallback(async (
    apiCall: () => Promise<Response>,
    attempt = 1
  ): Promise<any> => {
    if (attempt === 1) {
      setIsLoading(true);
      setError('');
      setRetryCount(0);
      setIsWarmingUp(false);
    }

    try {
      // Show warming up message immediately for retries, or after delay for first attempt
      if (attempt > 1) {
        setIsWarmingUp(true);
      } else {
        const warmupTimer = setTimeout(() => {
          setIsWarmingUp(true);
        }, config.warmupDelayMs);
        
        // Clear timer if request completes quickly
        setTimeout(() => clearTimeout(warmupTimer), config.timeoutMs);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);

      const response = await apiCall();
      
      // Apply abort signal after getting response object
      if (controller.signal.aborted) {
        throw new Error('Request was aborted');
      }
      
      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          setError('Resource not found');
          setIsLoading(false);
          setIsWarmingUp(false);
          throw new Error('Resource not found');
        } else if (response.status === 503 && data.error === 'Database unavailable' && attempt <= config.maxRetries) {
          // Database unavailable - retry with exponential backoff
          const newRetryCount = attempt;
          setRetryCount(newRetryCount);
          setIsWarmingUp(true);
          
          const delay = calculateDelay(attempt);
          return new Promise((resolve) => {
            setTimeout(() => {
              executeWithRetry(apiCall, attempt + 1).then(resolve).catch(() => {
                // This catch is handled by the outer try-catch
              });
            }, delay);
          });
        } else if (response.status === 503 && data.error === 'Database unavailable') {
          throw new Error('Database is taking longer than expected to start. Please try again in a few minutes.');
        } else {
          throw new Error(data.error || 'Request failed');
        }
      }

      // Success - reset states
      setIsWarmingUp(false);
      setRetryCount(0);
      setIsLoading(false);
      return data;
    } catch (err) {
      if (err instanceof Error && (err.name === 'AbortError' || err.message === 'Request was aborted')) {
        // Timeout occurred - retry if we haven't exceeded max retries
        if (attempt <= config.maxRetries) {
          const newRetryCount = attempt;
          setRetryCount(newRetryCount);
          setIsWarmingUp(true);
          
          const delay = calculateDelay(attempt);
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              executeWithRetry(apiCall, attempt + 1).then(resolve).catch(reject);
            }, delay);
          });
        } else {
          setError('Database is taking longer than expected to start. Please try again in a few minutes.');
          throw err;
        }
      } else if (err instanceof Error) {
        setError(err.message);
        throw err;
      } else {
        setError('An unexpected error occurred');
        throw new Error('An unexpected error occurred');
      }
    } finally {
      // Only set loading to false if we're not retrying
      if (attempt > config.maxRetries || error) {
        setIsLoading(false);
        setIsWarmingUp(false);
      }
    }
  }, [config.maxRetries, config.timeoutMs, config.warmupDelayMs, error]);

  const execute = useCallback((apiCall: () => Promise<Response>): Promise<any> => {
    return executeWithRetry(apiCall);
  }, [executeWithRetry]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setIsWarmingUp(false);
    setRetryCount(0);
    setError('');
  }, []);

  return {
    isLoading,
    isWarmingUp,
    retryCount,
    error,
    execute,
    reset,
  };
}

export { DEFAULT_OPTIONS as RETRY_DEFAULTS };
export type { RetryOptions, RetryState, RetryActions };