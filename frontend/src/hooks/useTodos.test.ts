import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTodos } from './useTodos';
import * as todoApi from '../api/todoApi';
import { useTodoStore } from '../store/todoStore';
import type { TodoListResponse } from '../types/todo';

vi.mock('../api/todoApi', async (importOriginal) => {
  const actual = await importOriginal<typeof todoApi>();
  return {
    ...actual,
    getTodos: vi.fn(),
  };
});

const mockListResponse: TodoListResponse = {
  items: [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Test Todo',
      description: null,
      completed: false,
      priority: 'medium',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: null,
    },
  ],
  total: 1,
  page: 1,
  page_size: 20,
  total_pages: 1,
};

describe('useTodos', () => {
  beforeEach(() => {
    useTodoStore.setState({
      todos: [],
      total: 0,
      page: 1,
      pageSize: 20,
      filters: { completed: null, priority: null, search: '' },
    });
    vi.clearAllMocks();
  });

  it('fetches todos on mount and populates store', async () => {
    vi.mocked(todoApi.getTodos).mockResolvedValue(mockListResponse);

    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.todos).toEqual(mockListResponse.items);
    expect(result.current.total).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it('sets error state when API call fails', async () => {
    const error = new todoApi.ApiError('SERVER_ERROR', 'Internal server error');
    vi.mocked(todoApi.getTodos).mockRejectedValue(error);

    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(error);
    expect(result.current.todos).toEqual([]);
  });

  it('shows loading state while fetch is in progress', async () => {
    let resolve!: (value: TodoListResponse) => void;
    const deferred = new Promise<TodoListResponse>((res) => {
      resolve = res;
    });
    vi.mocked(todoApi.getTodos).mockReturnValue(deferred);

    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    resolve(mockListResponse);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.todos).toEqual(mockListResponse.items);
  });

  it('refetch triggers a new API call', async () => {
    vi.mocked(todoApi.getTodos).mockResolvedValue(mockListResponse);

    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(vi.mocked(todoApi.getTodos)).toHaveBeenCalledTimes(2);
  });

  it('returns correct page and pageSize from store', async () => {
    vi.mocked(todoApi.getTodos).mockResolvedValue(mockListResponse);
    useTodoStore.setState({ page: 2, pageSize: 10 });

    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.page).toBe(2);
    expect(result.current.pageSize).toBe(10);
  });
});
