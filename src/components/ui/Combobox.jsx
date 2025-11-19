import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions, Label } from '@headlessui/react'
import { useState } from 'react'

// Placeholder ChevronDown icon component
const ChevronDownIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
  </svg>
)

const ComboboxComponent = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Select an option...",
  displayValue = (item) => item?.name || item?.label || item || '',
  renderOption = null, // New prop for custom option rendering
  renderSelectedIcon = null, // New prop for rendering icon next to selected value
  filterKey = 'name',
  allowCustomValue = true, // Default to true now
  acceptAnyInput = true, // New prop to allow any text input
  className = '',
  disabled = false,
  ...props
}) => {
  const [query, setQuery] = useState('')

  const filteredOptions =
    query === ''
      ? options
      : options.filter((option) => {
          const searchValue = option[filterKey] || option.name || option.label || ''
          return searchValue.toLowerCase().includes(query.toLowerCase())
        })

  const handleChange = (selectedOption) => {
    setQuery('')
    // If acceptAnyInput is true and we get a string value, pass it directly
    if (acceptAnyInput && typeof selectedOption === 'string') {
      onChange(selectedOption)
    } else {
      onChange(selectedOption)
    }
  }

  const handleInputChange = (event) => {
    const inputValue = event.target.value
    setQuery(inputValue)

    // If acceptAnyInput is true, call onChange immediately with the input value
    if (acceptAnyInput) {
      onChange(inputValue)
    }
  }

  return (
    <Combobox
      as="div"
      value={value}
      onChange={handleChange}
      disabled={disabled}
      className={className}
      {...props}
    >
      {label && (
        <Label className="block text-xs font-medium leading-4 text-gray-900">
          {label}
        </Label>
      )}
      <div className="relative mt-1">
        {renderSelectedIcon && value && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none z-10 mt-1">
            {renderSelectedIcon(value)}
          </div>
        )}
        <ComboboxInput
          className={`mt-1 block w-full rounded-md border-0 py-1.5 ${renderSelectedIcon && value ? 'pl-9' : 'pl-2'} pr-8 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 text-xs leading-4`}
          onChange={handleInputChange}
          onBlur={() => setQuery('')}
          displayValue={acceptAnyInput ? (item) => item || '' : displayValue}
          placeholder={placeholder}
        />
        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-hidden">
          <ChevronDownIcon className="size-4 text-gray-400" />
        </ComboboxButton>

        <ComboboxOptions
          transition
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg outline outline-black/5 data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 text-xs leading-4"
        >
          {/* Show current query as first option if acceptAnyInput is true and query exists */}
          {acceptAnyInput && query.length > 0 && (
            <ComboboxOption
              value={query}
              className="cursor-default px-3 py-2 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden"
            >
              <span className="block truncate">"{query}"</span>
            </ComboboxOption>
          )}

          {/* Show filtered options from the list */}
          {filteredOptions.length > 0 && filteredOptions.map((option, index) => (
            <ComboboxOption
              key={option.id || option.value || index}
              value={acceptAnyInput ? (option[filterKey] || option.name || option.label || option) : option}
              className="cursor-default px-3 py-2 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white data-focus:outline-hidden"
            >
              {renderOption ? (
                renderOption(option)
              ) : (
                <span className="block truncate">{displayValue(option)}</span>
              )}
            </ComboboxOption>
          ))}

          {/* Show message when no options available and no query */}
          {filteredOptions.length === 0 && !query && (
            <div className="px-3 py-2 text-gray-500 text-xs">
              {acceptAnyInput ? 'Type to enter a value or select from options' : 'No options available'}
            </div>
          )}
        </ComboboxOptions>
      </div>
    </Combobox>
  )
}

export default ComboboxComponent
