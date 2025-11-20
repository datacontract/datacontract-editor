/**
 * AuthoritativeDefinitionsEditor component for editing authoritative definitions
 * Provides a consistent interface across the application
 *
 * @param {Array} value - Array of authoritative definition objects
 * @param {Function} onChange - Callback when array changes
 */
const AuthoritativeDefinitionsEditor = ({ value = [], onChange }) => {
  const handleAdd = () => {
    const updatedArray = [...value, { type: '', url: '', description: '' }];
    onChange(updatedArray);
  };

  const handleRemove = (index) => {
    const updatedArray = value.filter((_, i) => i !== index);
    onChange(updatedArray.length > 0 ? updatedArray : undefined);
  };

  const handleUpdate = (index, fieldName, fieldValue) => {
    const updatedArray = [...value];
    updatedArray[index] = { ...updatedArray[index], [fieldName]: fieldValue };
    onChange(updatedArray);
  };

  const inputClasses = "w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs";

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
          <div className="flex flex-row items-center justify-start">
          Authoritative Definition
          </div>
          </label>

      {/* Display existing items */}
      {value.length > 0 && (
        <div className="mb-2 space-y-2">
          {value.map((item, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3 space-y-1.5 border border-gray-200 rounded p-1.5 bg-gray-50">
              {/* Type, URL, and Remove button in one line (4/7/1 ratio) */}
              <div className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-4">
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">Type</label>
                  <input
                    type="text"
                    value={item.type || ''}
                    onChange={(e) => handleUpdate(index, 'type', e.target.value)}
                    className={inputClasses}
                    placeholder="e.g., businessDefinition"
                  />
                </div>
                <div className="col-span-7">
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">URL</label>
                  <input
                    type="text"
                    value={item.url || ''}
                    onChange={(e) => handleUpdate(index, 'url', e.target.value)}
                    className={inputClasses}
                    placeholder="https://..."
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-1 text-gray-400 cursor-pointer border border-gray-300 rounded hover:text-red-400 hover:border-red-400 transition-colors justify-self-end"
                  title="Remove"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Description field */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">Description</label>
                <textarea
                  value={item.description || ''}
                  onChange={(e) => handleUpdate(index, 'description', e.target.value)}
                  className={inputClasses}
                  placeholder="Describe the authoritative definition..."
                  rows={2}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Always show add button */}
      <button
        type="button"
        onClick={handleAdd}
        className="w-full px-2 py-1 border-2 border-dashed border-gray-300 rounded text-xs text-gray-600 hover:border-indigo-400 hover:text-indigo-600"
      >
        + Add
      </button>

      <p className="mt-1 text-xs text-gray-500">Links to authoritative definitions and documentation sources</p>
    </div>
  );
};

export default AuthoritativeDefinitionsEditor;
