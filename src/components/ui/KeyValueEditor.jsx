import { useState } from 'react';

/**
 * KeyValueEditor component for editing arrays of objects
 * Supports custom field configurations
 *
 * @param {string} label - Label for the editor
 * @param {Array} value - Array of objects to edit
 * @param {Function} onChange - Callback when array changes
 * @param {Array} fields - Field configuration array: [{name, label, type, placeholder, options}]
 * @param {string} helpText - Optional help text
 */
const KeyValueEditor = ({ label, value = [], onChange, fields = [], helpText }) => {
  const [newItem, setNewItem] = useState({});
  const [isNewItemDirty, setIsNewItemDirty] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleRemove = (index) => {
    const updatedArray = value.filter((_, i) => i !== index);
    onChange(updatedArray.length > 0 ? updatedArray : undefined);
  };

  const handleNewItemChange = (fieldName, fieldValue) => {
    const updatedNewItem = { ...newItem, [fieldName]: fieldValue };
    setNewItem(updatedNewItem);
    setIsNewItemDirty(true);
  };

  const handleNewItemBlur = () => {
    // Use setTimeout to allow focus to move to another field
    setTimeout(() => {
      // Check if focus has moved outside the new item form
      const activeElement = document.activeElement;
      const isStillInForm = activeElement?.closest('.new-item-form');

      if (!isStillInForm) {
        // Only add if there's actual content
        const hasValue = Object.values(newItem).some(val => val?.trim && val.trim());

        if (hasValue && isNewItemDirty) {
          const updatedArray = [...value, newItem];
          onChange(updatedArray);
          setNewItem({});
          setIsNewItemDirty(false);
          setShowAddForm(false);
        }
      }
    }, 100);
  };

  const handleCancelAdd = () => {
    setNewItem({});
    setIsNewItemDirty(false);
    setShowAddForm(false);
  };

  const renderField = (field, itemValue, onChange, onBlur) => {
    const commonClasses = "w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs";

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={itemValue || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            className={commonClasses}
            placeholder={field.placeholder}
            rows={2}
          />
        );
      case 'select':
        return (
          <select
            value={itemValue || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            className={commonClasses}
          >
            <option value="">Select...</option>
            {field.options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type="text"
            value={itemValue || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            className={commonClasses}
            placeholder={field.placeholder}
          />
        );
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>

      {/* Display existing items */}
      {value.length > 0 && (
        <div className="mb-1 space-y-1">
          {value.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded p-1.5 bg-gray-50">
              <div className="space-y-1.5">
                {fields.map(field => (
                  <div key={field.name}>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
                      {field.label}:
                    </label>
                    {renderField(field, item[field.name], (fieldValue) => {
                      const updatedArray = [...value];
                      updatedArray[index] = { ...updatedArray[index], [field.name]: fieldValue };
                      onChange(updatedArray);
                    }, undefined)}
                  </div>
                ))}
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

      {/* Show add form */}
      {showAddForm && (
        <div className="new-item-form border border-gray-200 rounded p-2 bg-gray-50 space-y-1.5 mb-1">
          {fields.map(field => (
            <div key={field.name}>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">
                {field.label}
              </label>
              {renderField(field, newItem[field.name], (value) => {
                handleNewItemChange(field.name, value);
              }, handleNewItemBlur)}
            </div>
          ))}
          <button
            type="button"
            onClick={handleCancelAdd}
            className="mt-1 text-red-600 hover:text-red-800 text-xs font-medium"
          >
            Remove
          </button>
        </div>
      )}

      {/* Always show add button */}
      <button
        type="button"
        onClick={() => setShowAddForm(true)}
        className="w-full px-2 py-1 border-2 border-dashed border-gray-300 rounded text-xs text-gray-600 hover:border-indigo-400 hover:text-indigo-600"
      >
        + Add
      </button>

      {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
    </div>
  );
};

export default KeyValueEditor;
