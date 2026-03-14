import { useState, useEffect, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { getTodos } from '../api/todoApi';
import { useTodoStore } from '../store/todoStore';
import type { Todo } from '../types/todo';

interface UseTodosResult {
  todos: Todo[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useTodos(): UseTodosResult {
  // useShallow prevents a re-render on every store update by doing a shallow
  // equality check on the selected slice instead of referential equality.
  const { todos, total, page, pageSize, filters, setTodos } = useTodoStore(
    useShallow((state) => ({
      todos: state.todos,
      total: state.total,
      page: state.page,
      pageSize: state.pageSize,
      filters: state.filters,
      setTodos: state.setTodos,
    })),
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getTodos({
        page,
        page_size: pageSize,
        completed: filters.completed,
        priority: filters.priority,
        search: filters.search || undefined,
      });
      setTodos(result.items, result.total);
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error('An unexpected error occurred'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, filters, setTodos]);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return { todos, total, page, pageSize, isLoading, error, refetch: fetch };
}
