import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import type { Todo } from './types/todo';
import type { TodoFilters } from './store/todoStore';

// Make useShallow a pass-through so the store mock receives plain selectors
vi.mock('zustand/react/shallow', () => ({
  useShallow: <T,>(fn: (s: T) => unknown) => fn,
}));

const mockSetPage = vi.fn();
const mockSetFilters = vi.fn();

const mockStoreState: {
  filters: TodoFilters;
  setPage: typeof mockSetPage;
  setFilters: typeof mockSetFilters;
} = {
  filters: { completed: null, priority: null, search: '' },
  setPage: mockSetPage,
  setFilters: mockSetFilters,
};

vi.mock('./store/todoStore', () => ({
  useTodoStore: vi.fn((selector: (s: typeof mockStoreState) => unknown) =>
    selector(mockStoreState),
  ),
}));

const mockRefetch = vi.fn().mockResolvedValue(undefined);

const baseTodo: Todo = {
  id: '1',
  title: 'Test todo',
  description: null,
  completed: false,
  priority: 'medium',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: null,
};

let mockTodos: Todo[] = [baseTodo];

vi.mock('./hooks/useTodos', () => ({
  useTodos: vi.fn(() => ({
    todos: mockTodos,
    total: mockTodos.length,
    page: 1,
    pageSize: 20,
    isLoading: false,
    error: null,
    refetch: mockRefetch,
  })),
}));

const mockCreateTodo = vi.fn();
const mockUpdateTodo = vi.fn();
const mockDeleteTodo = vi.fn();

vi.mock('./api/todoApi', () => ({
  createTodo: (...args: unknown[]) => mockCreateTodo(...args),
  updateTodo: (...args: unknown[]) => mockUpdateTodo(...args),
  deleteTodo: (...args: unknown[]) => mockDeleteTodo(...args),
}));

beforeEach(() => {
  mockTodos = [baseTodo];
  vi.clearAllMocks();
  mockRefetch.mockResolvedValue(undefined);
});

describe('App', () => {
  it('renders the header and todo list', () => {
    render(<App />);
    expect(screen.getByText('Todo App')).toBeInTheDocument();
    expect(screen.getByText('Test todo')).toBeInTheDocument();
  });

  it('shows empty state when there are no todos', () => {
    mockTodos = [];
    render(<App />);
    expect(screen.getByText('No todos yet. Add one above!')).toBeInTheDocument();
  });

  it('shows filtered empty state when filters are active', () => {
    mockTodos = [];
    mockStoreState.filters = { completed: true, priority: null, search: '' };
    render(<App />);
    expect(screen.getByText('No results match your filters.')).toBeInTheDocument();
    mockStoreState.filters = { completed: null, priority: null, search: '' };
  });

  it('opens create modal when Add Todo is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Add Todo' }));
    expect(screen.getByRole('dialog', { name: 'New Todo' })).toBeInTheDocument();
  });

  it('creates a todo on form submit', async () => {
    const created: Todo = { ...baseTodo, id: '2', title: 'New task' };
    mockCreateTodo.mockResolvedValueOnce(created);
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Add Todo' }));
    await user.clear(screen.getByLabelText(/title/i));
    await user.type(screen.getByLabelText(/title/i), 'New task');
    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(mockCreateTodo).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'New task' }),
      );
    });
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('opens edit modal when Edit is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: `Edit "${baseTodo.title}"` }));
    expect(screen.getByRole('dialog', { name: 'Edit Todo' })).toBeInTheDocument();
    expect(screen.getByDisplayValue(baseTodo.title)).toBeInTheDocument();
  });

  it('updates a todo on edit form submit', async () => {
    const updated: Todo = { ...baseTodo, title: 'Updated task' };
    mockUpdateTodo.mockResolvedValueOnce(updated);
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: `Edit "${baseTodo.title}"` }));
    const titleInput = screen.getByDisplayValue(baseTodo.title);
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated task');
    await user.click(screen.getByRole('button', { name: 'Update' }));

    await waitFor(() => {
      expect(mockUpdateTodo).toHaveBeenCalledWith(
        baseTodo.id,
        expect.objectContaining({ title: 'Updated task' }),
      );
    });
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('toggles todo completion', async () => {
    mockUpdateTodo.mockResolvedValueOnce({ ...baseTodo, completed: true });
    const user = userEvent.setup();
    render(<App />);

    await user.click(
      screen.getByRole('checkbox', { name: `Mark "${baseTodo.title}" as complete` }),
    );

    await waitFor(() => {
      expect(mockUpdateTodo).toHaveBeenCalledWith(baseTodo.id, { completed: true });
    });
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('deletes a todo', async () => {
    mockDeleteTodo.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: `Delete "${baseTodo.title}"` }));

    await waitFor(() => {
      expect(mockDeleteTodo).toHaveBeenCalledWith(baseTodo.id);
    });
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('shows error banner on API failure', async () => {
    mockDeleteTodo.mockRejectedValueOnce(new Error('Network error'));
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: `Delete "${baseTodo.title}"` }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Network error');
    });
  });

  it('calls setFilters when filters change', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'completed' }));

    expect(mockSetFilters).toHaveBeenCalledWith(
      expect.objectContaining({ completed: true }),
    );
  });
});
