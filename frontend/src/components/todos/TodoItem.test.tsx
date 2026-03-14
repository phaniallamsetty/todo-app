import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TodoItem } from './TodoItem';
import type { Todo } from '../../types/todo';

const baseTodo: Todo = {
  id: 'abc-123',
  title: 'Buy groceries',
  description: 'Milk and eggs',
  completed: false,
  priority: 'medium',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: null,
};

describe('TodoItem', () => {
  it('renders title, priority badge, and description', () => {
    render(
      <TodoItem
        todo={baseTodo}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('Milk and eggs')).toBeInTheDocument();
  });

  it('applies line-through style when completed', () => {
    render(
      <TodoItem
        todo={{ ...baseTodo, completed: true }}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText('Buy groceries')).toHaveClass('line-through');
  });

  it('checkbox is checked when todo is completed', () => {
    render(
      <TodoItem
        todo={{ ...baseTodo, completed: true }}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('calls onToggle with todo id when checkbox clicked', async () => {
    const onToggle = vi.fn();
    render(
      <TodoItem
        todo={baseTodo}
        onToggle={onToggle}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith('abc-123');
  });

  it('calls onEdit with the todo when Edit clicked', async () => {
    const onEdit = vi.fn();
    render(
      <TodoItem
        todo={baseTodo}
        onToggle={vi.fn()}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith(baseTodo);
  });

  it('calls onDelete with todo id when Delete clicked', async () => {
    const onDelete = vi.fn();
    render(
      <TodoItem
        todo={baseTodo}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith('abc-123');
  });
});
