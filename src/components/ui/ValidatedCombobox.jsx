import { forwardRef } from 'react';
import Combobox from './Combobox.jsx';
import Tooltip from './Tooltip.jsx';

/**
 * A self-validating combobox component that shows errors when required field is empty.
 * Combines the template structure from Overview.jsx (lines 191-210) with validation logic from ValidatedInput.jsx.
 *
 * Features:
 * - Automatic validation for required fields
 * - Shows red ring when field has errors
 * - Displays error messages below the combobox
 * - Includes label with optional tooltip
 * - Shows "Required" indicator when field is required
 * - Supports ref forwarding for auto-focus functionality
 *
 * @example
 * ```jsx
 * <ValidatedCombobox
 *   name="status"
 *   label="Status"
 *   options={[
 *     { id: 'draft', name: 'draft' },
 *     { id: 'active', name: 'active' }
 *   ]}
 *   value={formData.status}
 *   onChange={(value) => updateField('status', value)}
 *   placeholder="Select a status..."
 *   required={true}
 *   tooltip="Current status of the data contract"
 *   externalErrors={[]}
 * />
 * ```
 *
 * @param {Object} props - Component props
 * @param {string} props.name - Field name (used for error message ID)
 * @param {string} props.label - Label text displayed above the combobox
 * @param {Array} props.options - Array of options for the dropdown
 * @param {string} props.value - Current selected value
 * @param {Function} props.onChange - Callback when value changes
 * @param {boolean} [props.required=false] - Whether the field is required
 * @param {string} [props.tooltip] - Optional tooltip text
 * @param {string} [props.placeholder] - Placeholder text
 * @param {Array} [props.externalErrors=[]] - External validation errors to display
 * @param {boolean} [props.acceptAnyInput=true] - Allow custom text input
 * @param {boolean} [props.disabled=false] - Disable the combobox
 */
const ValidatedCombobox = forwardRef(({
  name,
  label,
  value,
  onChange,
  options = [],
  required = false,
  tooltip,
  placeholder = "Select an option...",
  className = '',
  externalErrors = [],
  displayValue,
  renderOption,
  renderSelectedIcon,
  filterKey = 'name',
  allowCustomValue = true,
  acceptAnyInput = true,
  disabled = false,
  ...props
}, ref) => {

  // Internal validation - check if required field is empty
  const hasInternalError = required && (!value || value.trim === '' || (typeof value === 'string' && value.trim() === ''));

  // Combine internal and external errors
  const hasError = hasInternalError || externalErrors.length > 0;

  // Prepare error messages
  const errorMessages = [];
  if (hasInternalError) {
    errorMessages.push('This field is required');
  }
  errorMessages.push(...externalErrors);

  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <label className="block text-xs font-medium leading-4 text-gray-900">
          {label}
        </label>
        {tooltip && (
          <Tooltip content={tooltip}>
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </Tooltip>
        )}
        {required && (
          <span className="ml-auto text-xs leading-4 text-gray-500">Required</span>
        )}
      </div>
      <Combobox
        ref={ref}
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        displayValue={displayValue}
        renderOption={renderOption}
        renderSelectedIcon={renderSelectedIcon}
        filterKey={filterKey}
        allowCustomValue={allowCustomValue}
        acceptAnyInput={acceptAnyInput}
        disabled={disabled}
        hasError={hasError}
        className={className}
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

ValidatedCombobox.displayName = 'ValidatedCombobox';

export default ValidatedCombobox;