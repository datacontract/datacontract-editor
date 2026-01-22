import { useState, useMemo } from 'react';
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { getLogicalTypeIcon, fallbackLogicalTypeOptions } from '../../features/schema/propertyIcons';

const ChevronDownIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
  </svg>
);

/**
 * LogicalTypeCombobox - Combobox for selecting logical types with icons
 * Allows custom input with "string" as default
 */
const LogicalTypeCombobox = ({
  value,
  onChange,
  disabled = false,
  className = '',
  label = 'Logical Type',
  fallbackValue = null,
}) => {
  const [query, setQuery] = useState('');

  // Effective value: use value if set, otherwise use fallback from definition
  const effectiveValue = value || fallbackValue;
  const isFromDefinition = !value && !!fallbackValue;

  // Filter types based on query
  const filteredTypes = useMemo(() => {
    if (!query) return fallbackLogicalTypeOptions;

    const lowerQuery = query.toLowerCase();
    return fallbackLogicalTypeOptions.filter(type =>
      type.toLowerCase().includes(lowerQuery)
    );
  }, [query]);

  const handleChange = (selectedValue) => {
    setQuery('');
    // Allow undefined/null to clear the value (will then use fallback)
    onChange(selectedValue || undefined);
  };

  const handleInputChange = (event) => {
    const inputValue = event.target.value;
    setQuery(inputValue);
  };

  // When input is blurred, update with current query if not empty
  const handleBlur = () => {
    if (query && query.trim() !== '') {
      onChange(query.trim());
    }
    setQuery('');
  };

  const IconComponent = getLogicalTypeIcon(effectiveValue)

  return (
    <Combobox
      as="div"
      value={effectiveValue || ''}
      onChange={handleChange}
      disabled={disabled}
      className={className}
    >
      {label && (
        <Combobox.Label className="block text-xs font-medium text-gray-700 mb-1">
          {label}
        </Combobox.Label>
      )}
      <div className="relative">
        <ComboboxInput
          className={`w-full rounded-md border-0 bg-white py-1.5 pl-2 pr-8 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed ${isFromDefinition ? 'text-blue-500' : 'text-gray-900'}`}
          onChange={handleInputChange}
          onBlur={handleBlur}
          displayValue={(item) => item || ''}
          placeholder={fallbackValue || 'Select type...'}
        />
        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronDownIcon className="h-4 w-4 text-gray-400" />
        </ComboboxButton>

        <ComboboxOptions
          anchor="bottom start"
          transition
          className="z-[100] mt-1 max-h-60 min-w-[var(--input-width)] overflow-auto rounded-md bg-white py-1 text-xs shadow-lg ring-1 ring-black/5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Show current query as custom option if it doesn't match any existing types */}
          {query.length > 0 && !filteredTypes.includes(query) && (
            <ComboboxOption
              value={query}
              className="group relative cursor-pointer select-none py-2 pl-2 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white"
            >
              <span className="flex items-center gap-2">
                <span className="text-gray-400 group-data-[focus]:text-indigo-200 text-xs">Use:</span>
                <span className="block truncate font-medium">"{query}"</span>
              </span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-indigo-600 group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden">
                <CheckIcon className="h-4 w-4" />
              </span>
            </ComboboxOption>
          )}

          {/* Show filtered type options with icons */}
          {filteredTypes.map((type) => {
            const TypeIcon = getLogicalTypeIcon(type);
            return (
              <ComboboxOption
                key={type}
                value={type}
                className="group relative cursor-pointer select-none py-2 pl-2 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white"
              >
                <span className="flex items-center gap-2">
                  {TypeIcon && (
                    <span className="flex-shrink-0 text-gray-500 group-data-[focus]:text-white">
                      <TypeIcon className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <span className="block truncate font-normal group-data-[selected]:font-semibold">
                    {type}
                  </span>
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-indigo-600 group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden">
                  <CheckIcon className="h-4 w-4" />
                </span>
              </ComboboxOption>
            );
          })}

          {/* Show message when no options match */}
          {filteredTypes.length === 0 && query.length === 0 && (
            <div className="px-2 py-2 text-gray-500 text-xs">
              Type to enter a custom value
            </div>
          )}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
};

export default LogicalTypeCombobox;
