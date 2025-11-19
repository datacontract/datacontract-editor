import { useMemo } from 'react';
import { useEditorStore } from '../../store';
import { getSchemaEnumValues } from '../../lib/schemaEnumExtractor';
import Combobox from './Combobox';
import ChevronDownIcon from './icons/ChevronDownIcon.jsx';

/**
 * A smart field component that dynamically renders enum-based dropdowns
 * based on the loaded JSON schema. Works with custom schemas.
 *
 * @param {Object} props
 * @param {string} props.propertyPath - Dot-notation path to the property (e.g., 'logicalType')
 * @param {string} [props.context='property'] - Schema context ('property', 'root', etc.)
 * @param {string} props.value - Current field value
 * @param {Function} props.onChange - Change handler
 * @param {string} [props.label] - Field label
 * @param {string} [props.placeholder] - Placeholder text
 * @param {boolean} [props.allowCustomValue=false] - Allow values not in the enum
 * @param {boolean} [props.disabled=false] - Disable the field
 * @param {string} [props.className] - Additional CSS classes
 * @param {Array<string>} [props.fallbackOptions] - Fallback enum values if schema not loaded or enum not found
 */
const EnumField = ({
  propertyPath,
  context = 'property',
  value,
  onChange,
  label,
  placeholder,
  allowCustomValue = false,
  disabled = false,
  className = '',
  fallbackOptions = [],
  ...props
}) => {
  const schemaData = useEditorStore((state) => state.schemaData);

  // Extract enum values from schema
  const enumValues = useMemo(() => {
    if (!schemaData || !propertyPath) {
      return fallbackOptions;
    }

    const schemaEnums = getSchemaEnumValues(schemaData, propertyPath, context);
    return schemaEnums || fallbackOptions;
  }, [schemaData, propertyPath, context, fallbackOptions]);

  // If no enum values available, render a regular text input
  if (!enumValues || enumValues.length === 0) {
    return (
      <div className={className}>
        {label && (
          <label className="block text-xs font-medium leading-4 text-gray-900">
            {label}
          </label>
        )}
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="mt-1 block w-full rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 text-xs leading-4"
        />
      </div>
    );
  }

  // If custom values allowed, use Combobox for flexibility
  if (allowCustomValue) {
    return (
      <Combobox
        label={label}
        options={enumValues}
        value={value}
        onChange={onChange}
        placeholder={placeholder || "Select or type..."}
        disabled={disabled}
        className={className}
        acceptAnyInput={true}
        displayValue={(item) => item || ''}
        {...props}
      />
    );
  }

  // For strict enums, use a simple select dropdown
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium leading-4 text-gray-900 mb-1">
          {label}
        </label>
      )}
      <div className="grid grid-cols-1">
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 text-xs leading-4"
          {...props}
        >
          <option value="">{placeholder || 'Select...'}</option>
          {enumValues.map((enumValue) => (
            <option key={enumValue} value={enumValue}>
              {enumValue}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          aria-hidden="true"
          className="pointer-events-none col-start-1 row-start-1 mr-2 size-4 self-center justify-self-end text-gray-500"
        />
      </div>
    </div>
  );
};

export default EnumField;
