import { describe, it, expect, beforeEach } from 'vitest';
import { useTodoStore } from './todoStore';
import type { Todo } from '../types/todo';

const mockTodo: Todo = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Test Todo',
  description: null,
  completed: false,
  priority: 'medium',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: null,
};

const initialState = {
  todos: [],
  total: 0,
  page: 1,
  pageSize: 20,
  filters: { completed: null, priority: null, search: '' },
};

describe('todoStore', () => {
  beforeEach(() => {
    useTodoStore.setState(initialState);
  });

  describe('setTodos', () => {
    it('replaces todos and updates total', () => {
      useTodoStore.getState().setTodos([mockTodo], 1);
      const { todos, total } = useTodoStore.getState();
      expect(todos).toEqual([mockTodo]);
      expect(total).toBe(1);
    });
  });

  describe('setPage', () => {
    it('updates page number', () => {
      useTodoStore.getState().setPage(3);
      expect(useTodoStore.getState().page).toBe(3);
    });
  });

  describe('setFilters', () => {
    it('merges partial filter updates', () => {
      useTodoStore.getState().setFilters({ search: 'buy' });
      const { filters } = useTodoStore.getState();
      expect(filters.search).toBe('buy');
      expect(filters.completed).toBeNull();
    });

    it('resets page to 1 when filters change', () => {
      useTodoStore.setState({ page: 3 });
      useTodoStore.getState().setFilters({ completed: true });
      expect(useTodoStore.getState().page).toBe(1);
    });
  });

  describe('addTodo', () => {
    it('appends todo and increments total', () => {
      useTodoStore.setState({ todos: [], total: 0 });
      useTodoStore.getState().addTodo(mockTodo);
      const { todos, total } = useTodoStore.getState();
      expect(todos).toHaveLength(1);
      expect(todos[0]).toEqual(mockTodo);
      expect(total).toBe(1);
    });
  });

  describe('updateTodo', () => {
    it('updates matching todo by id', () => {
      useTodoStore.setState({ todos: [mockTodo] });
      useTodoStore.getState().updateTodo(mockTodo.id, { completed: true, title: 'Updated' });
      const { todos } = useTodoStore.getState();
      expect(todos[0]?.completed).toBe(true);
      expect(todos[0]?.title).toBe('Updated');
    });

    it('leaves non-matching todos unchanged', () => {
      const other: Todo = { ...mockTodo, id: 'other-id' };
      useTodoStore.setState({ todos: [mockTodo, other] });
      useTodoStore.getState().updateTodo('other-id', { completed: true });
      const { todos } = useTodoStore.getState();
      expect(todos[0]?.completed).toBe(false);
      expect(todos[1]?.completed).toBe(true);
    });
  });

  describe('removeTodo', () => {
    it('removes todo by id and decrements total', () => {
      useTodoStore.setState({ todos: [mockTodo], total: 1 });
      useTodoStore.getState().removeTodo(mockTodo.id);
      const { todos, total } = useTodoStore.getState();
      expect(todos).toHaveLength(0);
      expect(total).toBe(0);
    });
  });
});
