import { useState } from 'react';
import Tooltip from './Tooltip.jsx';

/**
 * Tags component for managing a list of tags
 * Allows adding/removing tags with a clean UI
 */
const Tags = ({
  label = "Tags",
  value = [],
  onChange,
  placeholder = "Add a tag...",
  tooltip,
  className = ''
}) => {
  const [newTag, setNewTag] = useState('');

  const handleAdd = () => {
    if (newTag.trim()) {
      const updatedTags = [...value, newTag.trim()];
      onChange(updatedTags);
      setNewTag('');
    }
  };

  const handleRemove = (index) => {
    const updatedTags = value.filter((_, i) => i !== index);
    onChange(updatedTags.length > 0 ? updatedTags : undefined);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
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
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Add new tag input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 rounded-md bg-white border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={handleAdd}
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
