import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TodoForm } from './TodoForm';
import type { Todo } from '../../types/todo';

const existingTodo: Todo = {
  id: 'xyz-456',
  title: 'Existing task',
  description: 'Details here',
  completed: false,
  priority: 'high',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: null,
};

describe('TodoForm', () => {
  it('shows Create button for new todo', () => {
    render(<TodoForm initialValues={null} onSubmit={vi.fn()} onCancel={vi.fn()} isSubmitting={false} />);
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
  });

  it('shows Update button when editing existing todo', () => {
    render(
      <TodoForm initialValues={existingTodo} onSubmit={vi.fn()} onCancel={vi.fn()} isSubmitting={false} />,
    );
    expect(screen.getByRole('button', { name: /update/i })).toBeInTheDocument();
  });

  it('shows validation error when title is empty', async () => {
    render(<TodoForm initialValues={null} onSubmit={vi.fn()} onCancel={vi.fn()} isSubmitting={false} />);
    await userEvent.click(screen.getByRole('button', { name: /create/i }));
    expect(screen.getByText('Title is required')).toBeInTheDocument();
  });

  it('shows validation error when title exceeds 200 characters', async () => {
    render(<TodoForm initialValues={null} onSubmit={vi.fn()} onCancel={vi.fn()} isSubmitting={false} />);
    await userEvent.type(screen.getByLabelText(/title/i), 'a'.repeat(201));
    await userEvent.click(screen.getByRole('button', { name: /create/i }));
    expect(screen.getByText('Title must be 200 characters or fewer')).toBeInTheDocument();
  });

  it('submits title and default priority for new todo', async () => {
    const onSubmit = vi.fn();
    render(<TodoForm initialValues={null} onSubmit={onSubmit} onCancel={vi.fn()} isSubmitting={false} />);
    await userEvent.type(screen.getByLabelText(/title/i), 'New task');
    await userEvent.click(screen.getByRole('button', { name: /create/i }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New task', priority: 'medium' }),
    );
  });

  it('does not call onSubmit when validation fails', async () => {
    const onSubmit = vi.fn();
    render(<TodoForm initialValues={null} onSubmit={onSubmit} onCancel={vi.fn()} isSubmitting={false} />);
    await userEvent.click(screen.getByRole('button', { name: /create/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onCancel when Cancel clicked', async () => {
    const onCancel = vi.fn();
    render(<TodoForm initialValues={null} onSubmit={vi.fn()} onCancel={onCancel} isSubmitting={false} />);
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('disables submit and shows Saving… when isSubmitting', () => {
    render(<TodoForm initialValues={null} onSubmit={vi.fn()} onCancel={vi.fn()} isSubmitting={true} />);
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
  });
});
