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
        Authoritative Definitions
      </label>

      {/* Display existing items */}
      {value.length > 0 && (
        <div className="mb-1 space-y-1">
          {value.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded p-1.5 bg-gray-50">
              <div className="space-y-1.5">
                {/* Type field */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">Type</label>
                  <input
                    type="text"
                    value={item.type || ''}
                    onChange={(e) => handleUpdate(index, 'type', e.target.value)}
                    className={inputClasses}
                    placeholder="e.g., businessDefinition"
                  />
                </div>
                {/* URL field */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">URL</label>
                  <input
                    type="text"
                    value={item.url || ''}
                    onChange={(e) => handleUpdate(index, 'url', e.target.value)}
                    className={inputClasses}
                    placeholder="https://..."
                  />
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
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="mt-1 text-red-600 hover:text-red-800 text-xs font-medium"
              >
                Remove
              </button>
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
