import { useState } from 'react';

/**
 * ArrayInput component for editing array of strings
 * Allows adding/removing items dynamically
 */
const ArrayInput = ({ label, value = [], onChange, placeholder = "Add item...", helpText }) => {
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    if (newItem.trim()) {
      const updatedArray = [...value, newItem.trim()];
      onChange(updatedArray);
      setNewItem('');
    }
  };

  const handleRemove = (index) => {
    const updatedArray = value.filter((_, i) => i !== index);
    onChange(updatedArray.length > 0 ? updatedArray : undefined);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>

      {/* Display existing items */}
      {value.length > 0 && (
        <div className="mb-1 space-y-0.5">
          {value.map((item, index) => (
            <div key={index} className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded text-xs">
              <span className="flex-1 text-gray-700">{item}</span>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new item */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Add
        </button>
      </div>

      {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
    </div>
  );
};

export default ArrayInput;
