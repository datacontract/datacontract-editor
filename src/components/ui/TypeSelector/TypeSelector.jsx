import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { useActiveServerType } from '../../../hooks/useActiveServerType';
import TypeSelectorPopover from './TypeSelectorPopover';

const ChevronDownIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
  </svg>
);

/**
 * TypeSelector - Compound component for logical and physical type selection
 *
 * Display logic: Shows physical type if set, otherwise falls back to logical type
 * Clicking opens a popover with both type selectors
 */
const TypeSelector = ({
  logicalType,
  onLogicalTypeChange,
  physicalType,
  onPhysicalTypeChange,
  serverType: serverTypeProp,
  disabled = false,
  className = '',
  logicalTypeFromDefinition,
}) => {
  // Use provided server type or get from store
  const storeServerType = useActiveServerType();
  const serverType = serverTypeProp || storeServerType;

  // Display: physical type if set, otherwise logical type
  const displayType = physicalType || logicalType || 'Select type...';

  // Check if logicalType matches definition (show in blue)
  const isFromDefinition = logicalTypeFromDefinition && logicalType === logicalTypeFromDefinition && !physicalType;

  return (
    <Popover className={`relative ${className}`}>
      {({ open, close }) => (
        <>
          <PopoverButton
            disabled={disabled}
            className={`
              group inline-flex items-center rounded-md px-2 py-1 text-xs
              ${isFromDefinition ? 'text-blue-400' : 'text-gray-700'} bg-white
              ring-inset
              hover:bg-gray-50 hover:ring-1 hover:ring-gray-300
              focus:outline-none focus:ring-2 focus:ring-indigo-500
              disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
              transition-all
              ${open ? 'ring-2 ring-indigo-500 bg-gray-50' : ''}
            `}
          >
            {/* Display type value */}
            <span>
              {displayType}
            </span>

            {/* Dropdown indicator - only visible on hover or when open */}
            <ChevronDownIcon className={`h-3.5 text-gray-400 flex-shrink-0 transition-all overflow-hidden ${open ? 'w-3.5 ml-1 opacity-100' : 'w-0 opacity-0 group-hover:w-3.5 group-hover:ml-1 group-hover:opacity-100'}`} />
          </PopoverButton>

          <PopoverPanel
            transition
            anchor="bottom start"
            className="z-50 mt-1 rounded-lg bg-white shadow-lg ring-1 ring-black/5 transition duration-100 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
            onClick={(e) => e.stopPropagation()}
          >
            <TypeSelectorPopover
              logicalType={logicalType}
              onLogicalTypeChange={(value) => {
                onLogicalTypeChange(value);
              }}
              physicalType={physicalType}
              onPhysicalTypeChange={(value) => {
                onPhysicalTypeChange(value);
              }}
              serverType={serverType}
              disabled={disabled}
              logicalTypeFromDefinition={logicalTypeFromDefinition}
            />
          </PopoverPanel>
        </>
      )}
    </Popover>
  );
};

export default TypeSelector;
