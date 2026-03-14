import { type FC } from 'react';

export const LoadingSpinner: FC = () => (
  <div className="flex justify-center py-8" role="status" aria-label="Loading">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
  </div>
);
