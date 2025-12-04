import { forwardRef } from 'react';
import Tooltip from './Tooltip.jsx';
import QuestionMarkCircleIcon from "./icons/QuestionMarkCircleIcon.jsx";

/**
 * A self-validating input component that shows errors when required field is empty
 * Follows Tailwind UI patterns for form validation
 * Supports ref forwarding for auto-focus functionality
 */
const ValidatedInput = forwardRef(({
  name,
  label,
  value,
  onChange,
  required = false,
  tooltip,
  placeholder,
  className = '',
  externalErrors = [],
  ...props
}, ref) => {

  // Internal validation - check if required field is empty
  const hasInternalError = required && (!value || value.toString().trim() === '');

  // Combine internal and external errors
  const hasError = hasInternalError || externalErrors.length > 0;

  // Prepare error messages
  const errorMessages = [];
  if (hasInternalError) {
    errorMessages.push('This field is required');
  }
  errorMessages.push(...externalErrors);

  // Determine ring color based on error state
  const ringClass = hasError
    ? 'ring-red-300 focus:ring-red-500'
    : 'ring-gray-300 focus:ring-indigo-600';

  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <label htmlFor={name} className="block text-xs font-medium leading-4 text-gray-900">
          {label}
        </label>
        {tooltip && (
          <Tooltip content={tooltip}>
						<QuestionMarkCircleIcon />
          </Tooltip>
        )}
        {required && (
          <span className="ml-auto text-xs leading-4 text-gray-500">Required</span>
        )}
      </div>
      <input
        ref={ref}
        type="text"
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        className={`mt-1 block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ${ringClass} placeholder:text-gray-400 focus:ring-2 focus:ring-inset disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 text-xs leading-4 ${className}`}
        placeholder={placeholder}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${name}-error` : undefined}
        {...props}
      />
      {hasError && errorMessages.map((message, idx) => (
        <p key={idx} id={`${name}-error`} className="mt-1 text-xs text-red-600">
          {message}
        </p>
      ))}
    </div>
  );
});

ValidatedInput.displayName = 'ValidatedInput';

export default ValidatedInput;
