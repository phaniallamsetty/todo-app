import { type FC, useRef, useState } from 'react';
import { type TodoFilters as FiltersState, type Priority } from '../../types/todo';

interface TodoFiltersProps {
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
}

type StatusOption = 'all' | 'active' | 'completed';
const STATUS_OPTIONS: StatusOption[] = ['all', 'active', 'completed'];

export const TodoFilters: FC<TodoFiltersProps> = ({ filters, onChange }) => {
  const [searchInput, setSearchInput] = useState(filters.search ?? '');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      onChange({ ...filters, search: value || undefined } satisfies FiltersState);
    }, 300);
  };

  const currentStatus = filters.status ?? 'all';

  return (
    <div className="flex flex-wrap items-center gap-4">
      <input
        type="search"
        value={searchInput}
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder="Search todos..."
        aria-label="Search todos"
        className="min-w-48 flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <div
        className="flex overflow-hidden rounded-md border border-gray-300"
        role="group"
        aria-label="Status filter"
      >
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            onClick={() =>
              onChange({ ...filters, status: status === 'all' ? undefined : status })
            }
            className={`border-r border-gray-300 px-3 py-2 text-sm capitalize last:border-r-0 ${
              currentStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>
      <select
        value={filters.priority ?? 'all'}
        onChange={(e) =>
          onChange({
            ...filters,
            priority:
              e.target.value === 'all' ? undefined : (e.target.value as Priority),
          })
        }
        aria-label="Priority filter"
        className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {(['all', 'low', 'medium', 'high'] as const).map((p) => (
          <option key={p} value={p}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
};
