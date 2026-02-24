import {useRef, useState} from 'react';
import {Combobox, ComboboxInput, ComboboxOption, ComboboxOptions} from '@headlessui/react';
import Tooltip from './Tooltip.jsx';
import QuestionMarkCircleIcon from './icons/QuestionMarkCircleIcon.jsx';

const FIXED_OPTIONS = [
  'pii', 'gdpr', 'finance', 'analytics', 'internal', 'public',
  'deprecated', 'experimental', 'critical', 'sensitive',
];

const Tags = ({
                label = "Tags",
                value = [],
                onChange,
                managedTags = FIXED_OPTIONS,
                placeholder = "Add a tag...",
                tooltip,
                className = ''
              }) => {
  const [newTag, setNewTag] = useState('');
  const inputRef = useRef(null);

  const handleAdd = (tag) => {
    if (tag.trim()) {
      const updatedTags = [...value, tag.trim()];
      onChange(updatedTags);
      setNewTag('');
    }
  };

  const handleRemove = (index) => {
    const updatedTags = value.filter((_, i) => i !== index);
    onChange(updatedTags.length > 0 ? updatedTags : undefined);
  };

  // Filter out already-added tags and match query
  const tagSuggestions = managedTags.filter(
    (tag) =>
      !value.includes(tag) &&
      (newTag === '' || tag.toLowerCase().includes(newTag.toLowerCase()))
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      // If HeadlessUI has an active option highlighted, let it handle via onChange
      if (inputRef.current?.getAttribute('aria-activedescendant')) return;

      e.preventDefault();
      handleAdd(newTag);
    }
  };

  return (
    <div className={className}>
      {label && (
        <div className="flex items-center gap-1 mb-1">
          <label className="block text-xs font-medium leading-4 text-gray-900">
            {label}
          </label>
          {tooltip && (
            <Tooltip content={tooltip}>
              <QuestionMarkCircleIcon />
            </Tooltip>
          )}
        </div>
      )}

      <div className="space-y-1">
        {/* Display existing tags */}
        {value && value.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {value.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
              >
                <svg className="size-1.5 fill-gray-500" viewBox="0 0 6 6" aria-hidden="true">
                  <circle cx="3" cy="3" r="3"></circle>
                </svg>
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="ml-0.5 hover:text-red-600 transition-colors"
                  aria-label={`Remove ${tag}`}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Add new tag input */}
        <div className="flex gap-2">
          <Combobox onChange={handleAdd}>
            <div className="relative flex-1">
              <ComboboxInput
                ref={inputRef}
                value={newTag}
                onChange={(e) => {
                  console.log("change", e.target.value)
                  setNewTag(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full rounded-md bg-white border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
              />
              <ComboboxOptions
                className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 text-xs shadow-lg outline outline-black/5 data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0">
                {tagSuggestions.length === 0 ? (
                  newTag.trim() ? (
                    <div className="px-3 py-2 text-gray-400">New Tag</div>
                  ) : null
                ) : (
                  tagSuggestions.map((tagSuggestion) => (
                    <ComboboxOption
                      key={tagSuggestion}
                      value={tagSuggestion}
                      className="cursor-default px-3 py-2 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white"
                    >
                      {tagSuggestion}
                    </ComboboxOption>
                  ))
                )}
              </ComboboxOptions>
            </div>
          </Combobox>
          <button
            type="button"
            onClick={() => handleAdd(newTag)}
            className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tags;
