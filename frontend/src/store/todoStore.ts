import { create } from 'zustand';
import type { Todo, Priority } from '../types/todo';

export interface TodoFilters {
  completed: boolean | null;
  priority: Priority | null;
  search: string;
}

interface TodoState {
  todos: Todo[];
  total: number;
  page: number;
  pageSize: number;
  filters: TodoFilters;
  setTodos: (todos: Todo[], total: number) => void;
  setPage: (page: number) => void;
  setFilters: (filters: Partial<TodoFilters>) => void;
  addTodo: (todo: Todo) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  removeTodo: (id: string) => void;
}

export const useTodoStore = create<TodoState>((set) => ({
  todos: [],
  total: 0,
  page: 1,
  pageSize: 20,
  filters: {
    completed: null,
    priority: null,
    search: '',
  },
  setTodos: (todos, total) => set({ todos, total }),
  setPage: (page) => set({ page }),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
      page: 1,
    })),
  addTodo: (todo) =>
    set((state) => ({
      todos: [...state.todos, todo],
      total: state.total + 1,
    })),
  updateTodo: (id, updates) =>
    set((state) => ({
      todos: state.todos.map((todo) => (todo.id === id ? { ...todo, ...updates } : todo)),
    })),
  removeTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id),
      total: state.total - 1,
    })),
}));
