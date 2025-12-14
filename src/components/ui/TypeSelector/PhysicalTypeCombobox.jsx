import { useState, useMemo } from 'react';
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { getGroupedPhysicalTypes } from './physicalTypeMappings';

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
 * PhysicalTypeCombobox - Combobox for selecting physical types with grouped suggestions
 */
const PhysicalTypeCombobox = ({
  value,
  onChange,
  serverType,
  logicalType,
  disabled = false,
  className = '',
  label = 'Physical Type',
  placeholder = 'e.g., VARCHAR(255)',
}) => {
  const [query, setQuery] = useState('');

  // Get grouped physical types for the server, filtered by logical type
  const groupedTypes = useMemo(() => {
    return getGroupedPhysicalTypes(serverType, logicalType);
  }, [serverType, logicalType]);

  // Filter types based on query
  const filteredGroups = useMemo(() => {
    if (!query) return groupedTypes;

    const lowerQuery = query.toLowerCase();
    return groupedTypes
      .map(group => ({
        ...group,
        types: group.types.filter(type =>
          type.toLowerCase().includes(lowerQuery)
        ),
      }))
      .filter(group => group.types.length > 0);
  }, [groupedTypes, query]);

  // Check if we have any matching types
  const hasMatchingTypes = filteredGroups.some(group => group.types.length > 0);

  const handleChange = (selectedValue) => {
    setQuery('');
    onChange(selectedValue);
  };

  const handleInputChange = (event) => {
    const inputValue = event.target.value;
    setQuery(inputValue);
    // Update value immediately for free-form input
    onChange(inputValue);
  };

  return (
    <Combobox
      as="div"
      value={value || ''}
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
          className="w-full rounded-md border-0 bg-white py-1.5 pl-2 pr-8 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
          onChange={handleInputChange}
          onBlur={() => setQuery('')}
          displayValue={(item) => item || ''}
          placeholder={placeholder}
        />
        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronDownIcon className="h-4 w-4 text-gray-400" />
        </ComboboxButton>

        <ComboboxOptions
          anchor="bottom start"
          transition
          className="z-[100] mt-1 max-h-72 min-w-[var(--input-width)] w-max overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Show current query as custom option if it's not empty and different from suggestions */}
          {query.length > 0 && (
            <ComboboxOption
              value={query}
              className="group relative cursor-pointer select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white"
            >
              <span className="flex items-center gap-2">
                <span className="text-gray-400 group-data-[focus]:text-indigo-200">Use:</span>
                <span className="block truncate font-medium">"{query}"</span>
              </span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-indigo-600 group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden">
                <CheckIcon className="h-4 w-4" />
              </span>
            </ComboboxOption>
          )}

          {/* Show grouped suggestions */}
          {filteredGroups.map((group) => (
            <div key={group.category}>
              {/* Group header - non-interactive */}
              <div className="sticky top-0 z-10 bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                {group.label}
              </div>
              {/* Group items */}
              {group.types.map((type) => (
                <ComboboxOption
                  key={`${group.category}-${type}`}
                  value={type}
                  className="group relative cursor-pointer select-none py-2 pl-4 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white"
                >
                  <span className="block truncate font-normal group-data-[selected]:font-semibold">
                    {type}
                  </span>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-indigo-600 group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden">
                    <CheckIcon className="h-4 w-4" />
                  </span>
                </ComboboxOption>
              ))}
            </div>
          ))}

          {/* Show message when no options match */}
          {!hasMatchingTypes && query.length === 0 && (
            <div className="px-2 py-2 text-gray-500 text-xs">
              Type to enter a custom value
            </div>
          )}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
};

export default PhysicalTypeCombobox;
