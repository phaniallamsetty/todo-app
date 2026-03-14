import { type FC } from 'react';
import { type Todo } from '../../types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_BADGE: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-red-100 text-red-800',
};

export const TodoItem: FC<TodoItemProps> = ({ todo, onToggle, onEdit, onDelete }) => {
  const formattedDate = new Date(todo.created_at).toLocaleDateString();

  return (
    <li className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600"
        aria-label={`Mark "${todo.title}" as ${todo.completed ? 'incomplete' : 'complete'}`}
      />
      <div className="min-w-0 flex-1">
        <p className={`font-medium text-gray-900 ${todo.completed ? 'line-through text-gray-400' : ''}`}>
          {todo.title}
        </p>
        {todo.description && (
          <p className="mt-0.5 text-sm text-gray-500">{todo.description}</p>
        )}
        <div className="mt-1 flex items-center gap-2">
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_BADGE[todo.priority]}`}>
            {todo.priority}
          </span>
          <span className="text-xs text-gray-400">{formattedDate}</span>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          onClick={() => onEdit(todo)}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
          aria-label={`Edit "${todo.title}"`}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="text-sm font-medium text-red-600 hover:text-red-800"
          aria-label={`Delete "${todo.title}"`}
        >
          Delete
        </button>
      </div>
    </li>
  );
};
