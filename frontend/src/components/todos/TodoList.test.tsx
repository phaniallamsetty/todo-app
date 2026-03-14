import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TodoList } from './TodoList';
import type { Todo } from '../../types/todo';

const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: 'todo-1',
  title: 'Test todo',
  description: null,
  completed: false,
  priority: 'medium',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: null,
  ...overrides,
});

const noop = vi.fn();

describe('TodoList', () => {
  it('shows loading spinner when isLoading is true', () => {
    render(
      <TodoList
        todos={[]}
        isLoading={true}
        onToggle={noop}
        onEdit={noop}
        onDelete={noop}
      />,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows empty state when todos array is empty', () => {
    render(
      <TodoList
        todos={[]}
        isLoading={false}
        onToggle={noop}
        onEdit={noop}
        onDelete={noop}
      />,
    );
    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
  });

  it('renders a TodoItem for each todo', () => {
    const todos = [
      makeTodo({ id: '1', title: 'First' }),
      makeTodo({ id: '2', title: 'Second' }),
    ];
    render(
      <TodoList
        todos={todos}
        isLoading={false}
        onToggle={noop}
        onEdit={noop}
        onDelete={noop}
      />,
    );
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('does not show empty state when todos are present', () => {
    render(
      <TodoList
        todos={[makeTodo()]}
        isLoading={false}
        onToggle={noop}
        onEdit={noop}
        onDelete={noop}
      />,
    );
    expect(screen.queryByText(/no todos yet/i)).not.toBeInTheDocument();
  });
});
