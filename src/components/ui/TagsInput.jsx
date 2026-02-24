import {useRef, useState} from 'react';
import {Combobox, ComboboxInput, ComboboxOption, ComboboxOptions} from '@headlessui/react';
import Tooltip from './Tooltip.jsx';
import QuestionMarkCircleIcon from './icons/QuestionMarkCircleIcon.jsx';

const FIXED_OPTIONS = [
  'pii', 'gdpr', 'finance', 'analytics', 'internal', 'public',
  'deprecated', 'experimental', 'critical', 'sensitive',
];
const MANAGED_DEMO = new Map(FIXED_OPTIONS.map((tag) => [tag.toLowerCase(), {
  tag: tag
}]));

const TagsInput = ({
                     label = "Tags",
                     value = [],
                     onChange,
                     managedTags = MANAGED_DEMO,
                     placeholder = "Add a tag...",
                     tooltip,
                     className = ''
                   }) => {
  const [newTag, setNewTag] = useState('');
  const inputRef = useRef(null);

  const handleAdd = (tag) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag)) {
      const updatedTags = [...value, trimmedTag];
      onChange(updatedTags);
      setNewTag('');
    }
  };

  const handleRemove = (index) => {
    const updatedTags = value.filter((_, i) => i !== index);
    onChange(updatedTags.length > 0 ? updatedTags : undefined);
  };

  // Filter out already-added tags and match query
  const suggestedTags = managedTags.entries().filter(
    ([key, managedTag]) =>
      !value.includes(managedTag.tag) &&
      (newTag === '' || key.includes(newTag.toLowerCase()))
  ).map(([, managedTag]) => managedTag.tag).toArray();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      // If HeadlessUI has an active option highlighted, let it handle via onChange
      if (inputRef.current?.getAttribute('aria-activedescendant')) return;

      e.preventDefault();
      handleAdd(newTag);
    }
  };

  const newTagAlreadyExists = value.some((existingTag) => existingTag.toLowerCase() === newTag.trim().toLowerCase())

  return (
    <div className={className}>
      {label && (
        <div className="flex items-center gap-1 mb-1">
          <label className="block text-xs font-medium leading-4 text-gray-900">
            {label}
          </label>
          {tooltip && (
            <Tooltip content={tooltip}>
              <QuestionMarkCircleIcon/>
            </Tooltip>
          )}
        </div>
      )}

      <div className="space-y-1">
        {/* Display existing tags */}
        {value && value.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {value.map((existingTag, index) => (
              <span
                key={index}
                className={"tag-element gap-x-1.5 mr-1 tag--badge " + (managedTags.has(existingTag.toLowerCase()) ? "badge--indigo" : "badge--gray")}
              >
                <svg className="size-1.5 fill-gray-500" viewBox="0 0 6 6" aria-hidden="true">
                  <circle cx="3" cy="3" r="3"></circle>
                </svg>
                {existingTag}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="ml-0.5 hover:text-red-600 transition-colors"
                  aria-label={`Remove ${existingTag}`}
                >
                  <span className="sr-only">Remove</span>
                  <svg className="w-2 h-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                    <path strokeLinecap="round" strokeWidth={1.5} d="M1 1l6 6m0-6L1 7"/>
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Add new tag input */}
        <div className="flex gap-2">
          <Combobox onChange={handleAdd} immediate={suggestedTags && suggestedTags.length <= 15}>
            <div className="relative flex-1">
              <ComboboxInput
                ref={inputRef}
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full rounded-md bg-white border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
              />
              <ComboboxOptions
                className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 text-xs shadow-lg outline outline-black/5 data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0">
                {suggestedTags.length > 0 ? (
                  suggestedTags.map((tagSuggestion) => (
                    <ComboboxOption
                      key={tagSuggestion}
                      value={tagSuggestion}
                      className="cursor-default px-3 py-2 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white"
                    >
                      {tagSuggestion}
                    </ComboboxOption>
                  ))
                ) : (
                  newTag ? (
                    newTagAlreadyExists ? (
                      <div className="px-3 py-2 text-gray-400">Tag '{newTag.trim()}' already exists</div>
                    ) : (
                      managedTags.size > 0 ? (
                        <ComboboxOption
                          key={newTag.trim()}
                          value={newTag.trim()}
                          className="cursor-default px-3 py-2 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white"
                        >
                          Add tag '{newTag.trim()}'
                        </ComboboxOption>
                      ) : null
                    )
                  ) : null)}
              </ComboboxOptions>
            </div>
          </Combobox>
          <button
            type="button"
            onClick={() => handleAdd(newTag)}
            disabled={newTagAlreadyExists}
            className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-300 transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagsInput;
