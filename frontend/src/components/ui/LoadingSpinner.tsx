interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-4',
};

export function LoadingSpinner({
  size = 'md',
  label = 'Loading…',
}: LoadingSpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className="inline-flex items-center justify-center"
    >
      <span
        className={`animate-spin rounded-full border-current border-t-transparent ${sizeClasses[size]}`}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
