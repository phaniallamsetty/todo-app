import { useState, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useTodos } from './hooks/useTodos';
import { useTodoStore } from './store/todoStore';
import { createTodo, updateTodo as apiUpdateTodo, deleteTodo } from './api/todoApi';
import { Header } from './components/layout/Header';
import { TodoFilters } from './components/todos/TodoFilters';
import { TodoList } from './components/todos/TodoList';
import { TodoForm } from './components/todos/TodoForm';
import { Modal } from './components/ui/Modal';
import { Pagination } from './components/ui/Pagination';
import type { Todo, TodoCreate, TodoUpdate, TodoFilters as UIFilters } from './types/todo';
import type { TodoFilters as StoreFilters } from './store/todoStore';

function toStoreFilters(ui: UIFilters): StoreFilters {
  return {
    completed: ui.status === 'completed' ? true : ui.status === 'active' ? false : null,
    priority: !ui.priority || ui.priority === 'all' ? null : ui.priority,
    search: ui.search ?? '',
  };
}

export default function App() {
  const { todos, total, page, pageSize, isLoading, error, refetch } = useTodos();
  const { filters, setPage, setFilters } = useTodoStore(
    useShallow((s) => ({
      filters: s.filters,
      setPage: s.setPage,
      setFilters: s.setFilters,
    })),
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const totalPages = Math.ceil(total / pageSize) || 1;
  const remainingCount = todos.filter((t) => !t.completed).length;
  const hasFilters = filters.completed !== null || filters.priority !== null || filters.search !== '';
  const displayError = error?.message ?? mutationError;

  const uiFilters: UIFilters = {
    search: filters.search,
    status:
      filters.completed === true ? 'completed' : filters.completed === false ? 'active' : 'all',
    priority: filters.priority ?? 'all',
  };

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingTodo(null);
  }, []);

  const handleToggle = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    setMutationError(null);
    try {
      await apiUpdateTodo(id, { completed: !todo.completed });
      await refetch();
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Failed to update todo');
    }
  };

  const handleDelete = async (id: string) => {
    setMutationError(null);
    try {
      await deleteTodo(id);
      await refetch();
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Failed to delete todo');
    }
  };

  const handleSubmit = async (data: TodoCreate | TodoUpdate) => {
    setIsSubmitting(true);
    setMutationError(null);
    try {
      if (editingTodo) {
        await apiUpdateTodo(editingTodo.id, data);
      } else {
        // Safe: TodoForm validates title is present before calling onSubmit
        await createTodo(data as TodoCreate);
      }
      await refetch();
      closeModal();
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const emptyMessage = hasFilters
    ? 'No results match your filters.'
    : 'No todos yet. Add one above!';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header remainingCount={remainingCount} />
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
        {displayError && (
          <div
            role="alert"
            className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 px-4 py-3"
          >
            <p className="text-sm text-red-700">{displayError}</p>
            <button
              onClick={() => {
                void refetch();
                setMutationError(null);
              }}
              className="ml-4 shrink-0 text-sm font-medium text-red-700 underline hover:text-red-900"
            >
              Retry
            </button>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1">
            <TodoFilters filters={uiFilters} onChange={(ui) => setFilters(toStoreFilters(ui))} />
          </div>
          <button
            onClick={() => {
              setEditingTodo(null);
              setModalOpen(true);
            }}
            className="shrink-0 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Todo
          </button>
        </div>
        <TodoList
          todos={todos}
          isLoading={isLoading}
          emptyMessage={emptyMessage}
          onToggle={(id) => void handleToggle(id)}
          onEdit={(todo) => {
            setEditingTodo(todo);
            setModalOpen(true);
          }}
          onDelete={(id) => void handleDelete(id)}
        />
        {totalPages > 1 && (
          <div className="flex justify-center pt-2">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </main>
      <Modal isOpen={modalOpen} onClose={closeModal} title={editingTodo ? 'Edit Todo' : 'New Todo'}>
        <TodoForm
          initialValues={editingTodo}
          onSubmit={(data) => void handleSubmit(data)}
          onCancel={closeModal}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
}
