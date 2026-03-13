import { useId, type InputHTMLAttributes } from 'react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  error?: string
  helperText?: string
}

export function Input({ label, error, helperText, className, ...props }: InputProps) {
  const id = useId()
  const errorId = `${id}-error`
  const helperId = `${id}-helper`

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        aria-invalid={error ? true : undefined}
        className={[
          'rounded-md border px-3 py-2 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-offset-1',
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500',
          'disabled:bg-gray-100 disabled:cursor-not-allowed',
          className ?? '',
        ].join(' ')}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={helperId} className="text-xs text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  )
}
