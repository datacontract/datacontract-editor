import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
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
 * LogicalTypeSelect - Dropdown for selecting logical types with icons
 */
const LogicalTypeSelect = ({
  value,
  onChange,
  disabled = false,
  className = '',
  label = 'Logical Type',
}) => {
  const IconComponent = getLogicalTypeIcon(value);

  return (
    <Listbox value={value || ''} onChange={onChange} disabled={disabled}>
      <div className={`relative ${className}`}>
        {label && (
          <Listbox.Label className="block text-xs font-medium text-gray-700 mb-1">
            {label}
          </Listbox.Label>
        )}
        <ListboxButton className="relative w-full cursor-pointer rounded-md bg-white py-1.5 pl-2 pr-8 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-xs disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed">
          <span className="flex items-center gap-2">
            {IconComponent && (
              <span className="flex-shrink-0 text-gray-500">
                <IconComponent className="h-3.5 w-3.5" />
              </span>
            )}
            <span className="block truncate">{value || 'Select type...'}</span>
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          </span>
        </ListboxButton>

        <ListboxOptions
          anchor="bottom start"
          transition
          className="z-[100] mt-1 max-h-60 min-w-[var(--button-width)] overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in"
          onClick={(e) => e.stopPropagation()}
        >
          {fallbackLogicalTypeOptions.map((type) => {
            const TypeIcon = getLogicalTypeIcon(type);
            return (
              <ListboxOption
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
              </ListboxOption>
            );
          })}
        </ListboxOptions>
      </div>
    </Listbox>
  );
};

export default LogicalTypeSelect;
