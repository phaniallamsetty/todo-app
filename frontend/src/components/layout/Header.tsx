import { type FC } from 'react';

interface HeaderProps {
  remainingCount: number;
}

export const Header: FC<HeaderProps> = ({ remainingCount }) => (
  <header className="border-b border-gray-200 bg-white shadow-sm">
    <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
      <h1 className="text-2xl font-bold text-gray-900">Todo App</h1>
      <p className="text-sm text-gray-500">
        {remainingCount} {remainingCount === 1 ? 'todo' : 'todos'} remaining
      </p>
    </div>
  </header>
);
