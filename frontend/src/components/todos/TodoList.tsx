import { type FC } from 'react';
import { type Todo } from '../../types/todo';
import { TodoItem } from './TodoItem';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface TodoListProps {
  todos: Todo[];
  isLoading: boolean;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export const TodoList: FC<TodoListProps> = ({ todos, isLoading, onToggle, onEdit, onDelete }) => {
  if (isLoading) return <LoadingSpinner />;

  if (todos.length === 0) {
    return (
      <p className="py-12 text-center text-gray-500">No todos yet. Add one above!</p>
    );
  }

  return (
    <ul className="space-y-2">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
};
