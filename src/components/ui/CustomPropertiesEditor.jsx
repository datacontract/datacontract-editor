import { useState } from 'react';

/**
 * CustomPropertiesEditor component for editing custom properties
 * Provides a consistent interface across the application with Property/Value in one row
 *
 * @param {Array} value - Array of custom property objects
 * @param {Function} onChange - Callback when array changes
 * @param {string} helpText - Optional help text
 * @param {boolean} showDescription - Whether to show description field (default: false)
 */
const CustomPropertiesEditor = ({ value = [], onChange, helpText, showDescription = false }) => {
  const [editingTypeIndex, setEditingTypeIndex] = useState(null);
  // Detect value type from actual value
  const detectType = (val) => {
    if (val === null || val === undefined) return 'string';
    if (typeof val === 'boolean') return 'boolean';
    if (typeof val === 'number') return 'number';
    if (Array.isArray(val)) return 'array';
    if (typeof val === 'object') return 'object';
    return 'string';
  };

  // Convert string input to typed value
  const convertValue = (strVal, type) => {
    if (type === 'string') return strVal;
    if (type === 'number') {
      const num = parseFloat(strVal);
      return isNaN(num) ? 0 : num;
    }
    if (type === 'boolean') {
      return strVal === 'true';
    }
    if (type === 'array' || type === 'object') {
      try {
        return JSON.parse(strVal);
      } catch {
        return type === 'array' ? [] : {};
      }
    }
    return strVal;
  };

  // Get string representation for display
  const getValueString = (val, type) => {
    if (type === 'array' || type === 'object') {
      try {
        return JSON.stringify(val, null, 2);
      } catch {
        return JSON.stringify(val);
      }
    }
    if (type === 'boolean') {
      return val === true ? 'true' : val === false ? 'false' : '';
    }
    return val?.toString() || '';
  };

  const handleAdd = () => {
    const newItem = { property: '', value: '' };
    if (showDescription) newItem.description = '';
    const updatedArray = [...value, newItem];
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

  const handleTypeChange = (index, newType) => {
    const item = value[index];
    const currentType = detectType(item.value);

    if (currentType === newType) return;

    let newValue;
    if (newType === 'string') {
      newValue = getValueString(item.value, currentType);
    } else if (newType === 'number') {
      newValue = 0;
    } else if (newType === 'boolean') {
      newValue = false;
    } else if (newType === 'array') {
      newValue = [];
    } else if (newType === 'object') {
      newValue = {};
    }

    handleUpdate(index, 'value', newValue);
  };

  const handleValueChange = (index, strVal, type) => {
    const converted = convertValue(strVal, type);
    handleUpdate(index, 'value', converted);
  };

  const inputClasses = "w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs";
  const selectClasses = "rounded border border-gray-300 bg-white px-1 py-0.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs text-gray-500";

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        Custom Properties
      </label>

      {/* Display existing items */}
      {value.length > 0 && (
        <div className="mb-2 space-y-2">
          {value.map((item, index) => {
            const type = detectType(item.value);
            return (
              <div key={index} className="bg-gray-50 rounded-lg p-3 space-y-1.5 border border-gray-200">
                {/* Property, Value, and Remove button in one line (4/7/1 ratio) */}
                <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4">
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Property</label>
                    <input
                      type="text"
                      value={item.property || ''}
                      onChange={(e) => handleUpdate(index, 'property', e.target.value)}
                      className={inputClasses}
                      placeholder="myCustomProperty"
                    />
                  </div>
                  <div className="col-span-7">
                    <div className="flex items-center gap-1 mb-0.5">
                      <label className="text-xs font-medium text-gray-700">Value</label>
                      {editingTypeIndex === index ? (
                        <select
                          value={type}
                          onChange={(e) => {
                            handleTypeChange(index, e.target.value);
                            setEditingTypeIndex(null);
                          }}
                          onBlur={() => setEditingTypeIndex(null)}
                          autoFocus
                          className={selectClasses}
                        >
                          <option value="string">string</option>
                          <option value="number">number</option>
                          <option value="boolean">boolean</option>
                          <option value="array">array</option>
                          <option value="object">object</option>
                        </select>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setEditingTypeIndex(index)}
                          className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          ({type})
                        </button>
                      )}
                    </div>
                    {type === 'boolean' ? (
                      <select
                        value={item.value === true ? 'true' : item.value === false ? 'false' : ''}
                        onChange={(e) => handleValueChange(index, e.target.value, 'boolean')}
                        className={inputClasses}
                      >
                        <option value="false">false</option>
                        <option value="true">true</option>
                      </select>
                    ) : type === 'number' ? (
                      <input
                        type="number"
                        step="any"
                        value={item.value ?? ''}
                        onChange={(e) => handleValueChange(index, e.target.value, 'number')}
                        className={inputClasses}
                        placeholder="0"
                      />
                    ) : type === 'array' || type === 'object' ? (
                      <textarea
                        value={getValueString(item.value, type)}
                        onChange={(e) => handleValueChange(index, e.target.value, type)}
                        className={`${inputClasses} font-mono`}
                        placeholder={type === 'array' ? '[\n  "item1",\n  "item2"\n]' : '{\n  "key": "value"\n}'}
                        rows={3}
                      />
                    ) : (
                      <input
                        type="text"
                        value={getValueString(item.value, type)}
                        onChange={(e) => handleValueChange(index, e.target.value, type)}
                        className={inputClasses}
                        placeholder="Enter value..."
                      />
                    )}
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

                {/* Description field (optional) */}
                {showDescription && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">Description</label>
                    <textarea
                      value={item.description || ''}
                      onChange={(e) => handleUpdate(index, 'description', e.target.value)}
                      className={inputClasses}
                      placeholder="Optional description..."
                      rows={2}
                    />
                  </div>
                )}
              </div>
            );
          })}
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

      {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
    </div>
  );
};

export default CustomPropertiesEditor;
