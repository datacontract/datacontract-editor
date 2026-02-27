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
  pattern,
  patternMessage,
  minLength,
  maxLength,
  minimum,
  maximum,
  validationKey,
  validationSection,
  skipInternalValidation = false,
  ...props
}, ref) => {

  // Internal validation - check if required field is empty
  const hasInternalError = !skipInternalValidation && required && (!value || value.toString().trim() === '');

  // Pattern validation
  const hasPatternError = !skipInternalValidation && pattern && value && typeof value === 'string' && value.trim() !== '' && (() => {
    try {
      return !new RegExp(pattern).test(value);
    } catch {
      return false;
    }
  })();

  // Length validation
  const trimmed = value && typeof value === 'string' ? value.trim() : '';
  const hasMinLengthError = !skipInternalValidation && minLength !== undefined && trimmed !== '' && trimmed.length < minLength;
  const hasMaxLengthError = !skipInternalValidation && maxLength !== undefined && trimmed !== '' && trimmed.length > maxLength;

  // Numeric range validation
  const numericValue = value !== undefined && value !== null && value !== '' ? Number(value) : NaN;
  const hasMinimumError = !skipInternalValidation && minimum !== undefined && !isNaN(numericValue) && numericValue < minimum;
  const hasMaximumError = !skipInternalValidation && maximum !== undefined && !isNaN(numericValue) && numericValue > maximum;

  // Combine internal and external errors
  const errorMessages = [];
  if (hasInternalError) {
    errorMessages.push('This field is required');
  }
  if (hasPatternError) {
    errorMessages.push(patternMessage || `Value must match pattern: ${pattern}`);
  }
  if (hasMinLengthError) {
    errorMessages.push(`Minimum length is ${minLength} (currently ${trimmed.length})`);
  }
  if (hasMaxLengthError) {
    errorMessages.push(`Maximum length is ${maxLength} (currently ${trimmed.length})`);
  }
  if (hasMinimumError) {
    errorMessages.push(`Minimum value is ${minimum}`);
  }
  if (hasMaximumError) {
    errorMessages.push(`Maximum value is ${maximum}`);
  }
  errorMessages.push(...externalErrors);

  const hasError = errorMessages.length > 0;

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
