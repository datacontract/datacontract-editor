import {useMemo, useRef, useState} from 'react';
import {Combobox, ComboboxInput, ComboboxOption, ComboboxOptions} from '@headlessui/react';
import Tooltip from './Tooltip.jsx';
import QuestionMarkCircleIcon from './icons/QuestionMarkCircleIcon.jsx';

const TagsInput = ({
                     label = "Tags",
                     value = [],
                     onChange,
                     managedTags = [],
                     allowUnmanagedTags = true,
                     placeholder = "Add a tag...",
                     tooltip,
                     className = ''
                   }) => {
  const [newTag, setNewTag] = useState('');
  const inputRef = useRef(null);

  const managedTagsMap = useMemo(() => {
    return new Map(managedTags.map(managedTag => [managedTag.tag.toLowerCase(), managedTag]));
  }, [managedTags]);

  // Filter out already-added tags and match query
  const suggestedTags = useMemo(() => Array.from(managedTagsMap.entries())
    .filter(([key, managedTag]) =>
      !value.includes(managedTag.tag) &&
      (newTag === '' || key.includes(newTag.trim().toLowerCase())))
    .map(([, managedTag]) => managedTag.tag), [managedTagsMap, value, newTag])
    .slice(0, 100);

  const doesTagExist = (tag) => value.some((existingTag) => existingTag.toLowerCase() === tag.trim().toLowerCase());
  const canTagBeAdded = (tag) => !doesTagExist(tag) && (allowUnmanagedTags || managedTagsMap.has(tag.trim().toLowerCase()));

  const handleAdd = (tag) => {
    if (!tag) return;
    if (!canTagBeAdded(tag)) return;

    const updatedTags = [...value, tag.trim()];
    onChange(updatedTags);
    setNewTag('');
  };

  const handleRemove = (index) => {
    const updatedTags = value.filter((_, i) => i !== index);
    onChange(updatedTags.length > 0 ? updatedTags : undefined);
  };

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
              <QuestionMarkCircleIcon/>
            </Tooltip>
          )}
        </div>
      )}

      <div className="space-y-1">
        {/* Display existing tags */}
        {value && value.length > 0 && (
          <div className="flex items-center flex-wrap">
            {value.map((existingTag, index) => {
              const existingTagIsManaged = managedTagsMap.has(existingTag.toLowerCase());

              if (!allowUnmanagedTags && !existingTagIsManaged) return (
                <span
                  key={index}
                  className={"tag-element m-0.5 badge--gray bg-yellow-50 text-yellow-700"}
                  title="This tag is unmanaged."
                >
                  <svg className="h-4 w-4 text-yellow-400 mr-1" viewBox="0 0 20 20" fill="currentColor"
                       aria-hidden="true">
                    <path fillRule="evenodd"
                          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                          clipRule="evenodd"></path>
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
              );

              return (
                <span
                  key={index}
                  className={"tag-element m-0.5" + (existingTagIsManaged ? " badge--indigo" : " badge--gray")}
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
              );
            })}
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
                onBlur={() => {
                  // HeadlessUI resets input DOM value on close; restore it immediately
                  requestAnimationFrame(() => {
                    if (inputRef.current) {
                      inputRef.current.value = newTag;
                    }
                  });
                }}
                placeholder={placeholder}
                className="w-full rounded-md bg-white border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
              />
              {managedTagsMap.size > 0 && <ComboboxOptions
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
                    doesTagExist(newTag) ? (
                      <div className="px-3 py-2 text-gray-400">Tag '{newTag.trim()}' already exists</div>
                    ) : (
                      canTagBeAdded(newTag) ? (
                        <ComboboxOption
                          key={newTag.trim()}
                          value={newTag.trim()}
                          className="cursor-default px-3 py-2 text-gray-900 select-none data-focus:bg-indigo-600 data-focus:text-white"
                        >
                          Add tag '{newTag.trim()}'
                        </ComboboxOption>
                      ) : (
                        <div className="px-3 py-2 text-gray-400">According to the organization settings, only managed tags are permitted.</div>
                      )
                    )
                  ) : null)}
              </ComboboxOptions>
              }            </div>
          </Combobox>
          <button
            type="button"
            onClick={() => handleAdd(newTag)}
            disabled={!canTagBeAdded(newTag)}
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
