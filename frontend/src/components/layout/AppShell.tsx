import { type FC, type ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
}

export const AppShell: FC<AppShellProps> = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-3xl px-4 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Todo App</h1>
      </div>
    </header>
    <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
  </div>
);
