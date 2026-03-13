import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { TodoFilters } from './TodoFilters';

describe('TodoFilters', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders search input, status buttons, and priority select', () => {
    render(<TodoFilters filters={{}} onChange={vi.fn()} />);
    expect(screen.getByRole('searchbox', { name: /search/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /status filter/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /priority filter/i })).toBeInTheDocument();
  });

  it('calls onChange with status: active when Active clicked', async () => {
    const onChange = vi.fn();
    render(<TodoFilters filters={{}} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: /active/i }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ status: 'active' }));
  });

  it('calls onChange with status: undefined when All clicked', async () => {
    const onChange = vi.fn();
    render(<TodoFilters filters={{ status: 'active' }} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: /^all$/i }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ status: undefined }));
  });

  it('calls onChange with priority when priority select changes', async () => {
    const onChange = vi.fn();
    render(<TodoFilters filters={{}} onChange={onChange} />);
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /priority/i }), 'high');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ priority: 'high' }));
  });

  it('debounces search input by 300ms', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(<TodoFilters filters={{}} onChange={onChange} />);

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'groceries' } });
    expect(onChange).not.toHaveBeenCalledWith(expect.objectContaining({ search: 'groceries' }));

    act(() => { vi.advanceTimersByTime(300); });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ search: 'groceries' }));
  });
});
