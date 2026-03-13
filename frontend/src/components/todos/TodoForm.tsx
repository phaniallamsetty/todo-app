import { type FC, type FormEvent, useState, useEffect } from 'react';
import { type Todo, type TodoCreate, type TodoUpdate, type Priority } from '../../types/todo';

interface TodoFormProps {
  initialValues: Todo | null;
  onSubmit: (data: TodoCreate | TodoUpdate) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const TodoForm: FC<TodoFormProps> = ({ initialValues, onSubmit, onCancel, isSubmitting }) => {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [priority, setPriority] = useState<Priority>(initialValues?.priority ?? 'medium');
  const [titleError, setTitleError] = useState('');

  useEffect(() => {
    setTitle(initialValues?.title ?? '');
    setDescription(initialValues?.description ?? '');
    setPriority(initialValues?.priority ?? 'medium');
    setTitleError('');
  }, [initialValues]);

  const validate = (): boolean => {
    if (!title.trim()) {
      setTitleError('Title is required');
      return false;
    }
    if (title.trim().length > 200) {
      setTitleError('Title must be 200 characters or fewer');
      return false;
    }
    setTitleError('');
    return true;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            titleError ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="What needs to be done?"
        />
        {titleError && <p className="mt-1 text-xs text-red-600">{titleError}</p>}
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Optional details..."
        />
      </div>
      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
          Priority
        </label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : initialValues ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};
