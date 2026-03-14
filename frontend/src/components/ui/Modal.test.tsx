import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from './Modal';

describe('Modal', () => {
  it('renders content when open', () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Test Modal">
        <p>Body content</p>
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Test Modal">
        <p>Body content</p>
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when close button clicked', async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Test Modal">
        <p>Content</p>
      </Modal>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Close modal' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay clicked', async () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal isOpen onClose={onClose} title="Test Modal">
        <p>Content</p>
      </Modal>,
    );
    const overlay = container.ownerDocument.querySelector('[aria-hidden="true"]');
    expect(overlay).not.toBeNull();
    await userEvent.click(overlay!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key pressed', async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Test Modal">
        <p>Content</p>
      </Modal>,
    );
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('focuses close button on open', () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Test Modal">
        <p>Content</p>
      </Modal>,
    );
    expect(screen.getByRole('button', { name: 'Close modal' })).toHaveFocus();
  });
});
