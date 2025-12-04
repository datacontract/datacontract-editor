import { useState } from 'react';
import CustomPropertyIcon from './icons/CustomPropertyIcon.jsx';
import ChevronRightIcon from './icons/ChevronRightIcon.jsx';

/**
 * CustomPropertiesEditor component for editing custom properties
 * Provides a consistent interface across the application with expandable cards
 *
 * @param {Array} value - Array of custom property objects
 * @param {Function} onChange - Callback when array changes
 * @param {boolean} showDescription - Whether to show description field (default: false)
 */
const CustomPropertiesEditor = ({ value = [], onChange, showDescription = false }) => {
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

  return (
    <div className="space-y-2">
      {/* Header with label and add button */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-700">Custom Properties</label>
        <button
          type="button"
          onClick={handleAdd}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
        >
          + Add
        </button>
      </div>

      {/* Existing properties */}
      {value.map((item, index) => (
        <CustomPropertyCard
          key={index}
          item={item}
          index={index}
          showDescription={showDescription}
          onUpdate={handleUpdate}
          onRemove={handleRemove}
        />
      ))}
    </div>
  );
};

const CustomPropertyCard = ({ item, index, showDescription, onUpdate, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(!item.property);
  const [editingType, setEditingType] = useState(false);

  const inputClasses = "w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs";
  const selectClasses = "rounded border border-gray-300 bg-white px-1 py-0.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs text-gray-500";

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
      // Store the raw string value directly without parsing
      return strVal;
    }
    return strVal;
  };

  // Get string representation for display
  const getValueString = (val, type) => {
    if (type === 'array' || type === 'object') {
      // If it's already a string, return it as-is
      if (typeof val === 'string') {
        return val;
      }
      // If it's an actual object/array, stringify it
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

  const handleTypeChange = (newType) => {
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

    onUpdate(index, 'value', newValue);
  };

  const handleValueChange = (strVal, type) => {
    const converted = convertValue(strVal, type);
    onUpdate(index, 'value', converted);
  };

  const type = detectType(item.value);

  // Get summary line showing key = value
  const getSummaryLine = () => {
    if (!item.property && !item.value) return null;

    const key = item.property || '';
    let valStr = getValueString(item.value, type);

    // For arrays/objects, show compact version
    if (type === 'array' || type === 'object') {
      valStr = JSON.stringify(item.value);
    }

    // Truncate the combined string if too long
    const combined = `${key} = ${valStr}`;
    return combined.length > 60 ? combined.substring(0, 60) + '...' : combined;
  };

  return (
    <div className="border border-gray-200 rounded-md bg-white">
      {/* Header - Always visible */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50 rounded-md"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <CustomPropertyIcon className="size-3 text-indigo-600 shrink-0" />
            <span className="text-xs font-medium text-gray-900">Custom Property</span>
            <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{type}</span>
          </div>
          <div className="text-xs text-gray-600 mt-0.5 truncate">
            {getSummaryLine() ? (
              <span className="font-mono">{getSummaryLine()}</span>
            ) : (
              <span className="italic text-gray-400">New property</span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <ChevronRightIcon
            className={`h-3 w-3 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          />
        </button>
      </div>

      {/* Expandable content */}
      {isExpanded && (
        <div className="border-t border-gray-200 px-3 py-3 space-y-3">
          {/* Property, Value, and Remove button in one line */}
          <div className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">Property</label>
              <input
                type="text"
                value={item.property || ''}
                onChange={(e) => onUpdate(index, 'property', e.target.value)}
                className={inputClasses}
                placeholder="myCustomProperty"
              />
            </div>
            <div className="col-span-7">
              <div className="flex items-center gap-1 h-6">
                <label className="text-xs font-medium text-gray-700">Value</label>
                {editingType ? (
                  <select
                    value={type}
                    onChange={(e) => {
                      handleTypeChange(e.target.value);
                      setEditingType(false);
                    }}
                    onBlur={() => setEditingType(false)}
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
                    onClick={() => setEditingType(true)}
                    className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    ({type})
                  </button>
                )}
              </div>
              {type === 'boolean' ? (
                <select
                  value={item.value === true ? 'true' : item.value === false ? 'false' : ''}
                  onChange={(e) => handleValueChange(e.target.value, 'boolean')}
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
                  onChange={(e) => handleValueChange(e.target.value, 'number')}
                  className={inputClasses}
                  placeholder="0"
                />
              ) : type === 'array' || type === 'object' ? (
                <input
                  type="text"
                  value={getValueString(item.value, type)}
                  onChange={(e) => handleValueChange(e.target.value, type)}
                  className={`${inputClasses} font-mono`}
                  placeholder={type === 'array' ? '["item1", "item2"]' : '{"key": "value"}'}
                />
              ) : (
                <input
                  type="text"
                  value={getValueString(item.value, type)}
                  onChange={(e) => handleValueChange(e.target.value, type)}
                  className={inputClasses}
                  placeholder="Enter value..."
                />
              )}
            </div>
            <button
              type="button"
              onClick={() => onRemove(index)}
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
                onChange={(e) => onUpdate(index, 'description', e.target.value)}
                className={inputClasses}
                placeholder="Optional description..."
                rows={2}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomPropertiesEditor;
