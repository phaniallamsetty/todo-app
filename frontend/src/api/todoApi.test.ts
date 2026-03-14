import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  ApiError,
} from './todoApi';
import type { ApiEnvelope, Todo, TodoListResponse } from '../types/todo';

const { mockGet, mockPost, mockPut, mockDelete } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockPut: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock('axios', () => ({
  default: {
    create: () => ({
      get: mockGet,
      post: mockPost,
      put: mockPut,
      delete: mockDelete,
    }),
  },
}));

const mockTodo: Todo = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Test Todo',
  description: null,
  completed: false,
  priority: 'medium',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: null,
};

const mockListResponse: TodoListResponse = {
  items: [mockTodo],
  total: 1,
  page: 1,
  page_size: 20,
  total_pages: 1,
};

function envelope<T>(data: T): { data: ApiEnvelope<T> } {
  return { data: { data, meta: { version: '0.1.0' }, error: null } };
}

function errorEnvelope(code: string, message: string): { data: ApiEnvelope<null> } {
  return { data: { data: null, meta: { version: '0.1.0' }, error: { code, message } } };
}

describe('todoApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTodos', () => {
    it('returns TodoListResponse on success', async () => {
      mockGet.mockResolvedValue(envelope(mockListResponse));
      const result = await getTodos({ page: 1, page_size: 20 });
      expect(result).toEqual(mockListResponse);
      expect(mockGet).toHaveBeenCalledWith('/todos', {
        params: { page: 1, page_size: 20 },
      });
    });

    it('throws ApiError when envelope contains error', async () => {
      mockGet.mockResolvedValue(errorEnvelope('NOT_FOUND', 'Not found'));
      await expect(getTodos()).rejects.toThrow(ApiError);
    });
  });

  describe('getTodoById', () => {
    it('returns Todo on success', async () => {
      mockGet.mockResolvedValue(envelope(mockTodo));
      const result = await getTodoById(mockTodo.id);
      expect(result).toEqual(mockTodo);
      expect(mockGet).toHaveBeenCalledWith(`/todos/${mockTodo.id}`);
    });

    it('throws ApiError with correct code on error', async () => {
      mockGet.mockResolvedValue(errorEnvelope('TODO_NOT_FOUND', 'Todo not found'));
      const err = await getTodoById('bad-id').catch((e: unknown) => e);
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).code).toBe('TODO_NOT_FOUND');
    });
  });

  describe('createTodo', () => {
    it('returns created Todo on success', async () => {
      mockPost.mockResolvedValue(envelope(mockTodo));
      const result = await createTodo({ title: 'Test Todo' });
      expect(result).toEqual(mockTodo);
      expect(mockPost).toHaveBeenCalledWith('/todos', { title: 'Test Todo' });
    });
  });

  describe('updateTodo', () => {
    it('returns updated Todo on success', async () => {
      const updated = { ...mockTodo, completed: true };
      mockPut.mockResolvedValue(envelope(updated));
      const result = await updateTodo(mockTodo.id, { completed: true });
      expect(result).toEqual(updated);
      expect(mockPut).toHaveBeenCalledWith(`/todos/${mockTodo.id}`, {
        completed: true,
      });
    });
  });

  describe('deleteTodo', () => {
    it('resolves without returning a value', async () => {
      mockDelete.mockResolvedValue({ data: undefined });
      const result = await deleteTodo(mockTodo.id);
      expect(result).toBeUndefined();
      expect(mockDelete).toHaveBeenCalledWith(`/todos/${mockTodo.id}`);
    });
  });
});
