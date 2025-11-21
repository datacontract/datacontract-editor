import { useMemo } from 'react';
import { useEditorStore } from '../store.js';
import * as YAML from 'yaml';

const CustomProperties = () => {
  const yaml = useEditorStore((state) => state.yaml);
  const setYaml = useEditorStore((state) => state.setYaml);
  const currentView = useEditorStore((state) => state.currentView);

  const typeOptions = [
    { id: 'string', name: 'string' },
    { id: 'number', name: 'number' },
    { id: 'boolean', name: 'boolean' },
    { id: 'array', name: 'array' },
    { id: 'object', name: 'object' }
  ];

  // Parse current YAML to extract form values
  const formData = useMemo(() => {
    if (!yaml?.trim()) {
      return { customProperties: [] };
    }

    try {
      const parsed = YAML.parse(yaml);
      return {
        customProperties: parsed.customProperties || []
      };
    } catch {
      return { customProperties: [] };
    }
  }, [yaml]);

  // Detect value type
  const detectType = (value) => {
    if (value === null) return 'string';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return 'string';
  };

  // Convert value based on type
  const convertValue = (valueStr, type) => {
    if (!valueStr && type !== 'boolean') return undefined;

    switch (type) {
      case 'number':
        const num = parseFloat(valueStr);
        return isNaN(num) ? undefined : num;
      case 'boolean':
        if (valueStr === 'true' || valueStr === true) return true;
        if (valueStr === 'false' || valueStr === false) return false;
        return undefined;
      case 'array':
        try {
          const parsed = JSON.parse(valueStr);
          return Array.isArray(parsed) ? parsed : undefined;
        } catch {
          return undefined;
        }
      case 'object':
        try {
          const parsed = JSON.parse(valueStr);
          return typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : undefined;
        } catch {
          return undefined;
        }
      case 'string':
      default:
        return valueStr || undefined;
    }
  };

  // Update YAML when form fields change
  const updateField = (value) => {
    try {
      let parsed = {};
      if (yaml?.trim()) {
        try {
          parsed = YAML.parse(yaml) || {};
        } catch {
          parsed = {};
        }
      }

      if (value && value.length > 0) {
        // Remove _type field before saving to YAML
        const cleanedProperties = value.map(prop => {
          const { _type, ...rest } = prop;
          return rest;
        });
        parsed.customProperties = cleanedProperties;
      } else {
        delete parsed.customProperties;
      }

      // Convert back to YAML
      const newYaml = YAML.stringify(parsed);
      setYaml(newYaml);
    } catch (error) {
      console.error('Error updating YAML:', error);
    }
  };

  // Update a specific custom property
  const updateProperty = (index, field, value) => {
    const updatedProperties = [...formData.customProperties];

    if (field === 'type') {
      // When type changes, convert the value
      const currentValue = updatedProperties[index].value;
      const currentType = detectType(currentValue);

      if (currentType !== value) {
        // Convert value to new type
        let convertedValue;
        if (value === 'string') {
          convertedValue = currentValue?.toString() || '';
        } else if (value === 'number') {
          convertedValue = 0;
        } else if (value === 'boolean') {
          convertedValue = undefined;
        } else if (value === 'array') {
          convertedValue = [];
        } else if (value === 'object') {
          convertedValue = {};
        }
        updatedProperties[index] = {
          ...updatedProperties[index],
          value: convertedValue,
          _type: value
        };
      }
    } else if (field === 'value') {
      const type = updatedProperties[index]._type || detectType(updatedProperties[index].value);
      updatedProperties[index] = {
        ...updatedProperties[index],
        value: convertValue(value, type),
        _type: type
      };
    } else {
      updatedProperties[index] = {
        ...updatedProperties[index],
        [field]: value || undefined
      };
    }

    updateField(updatedProperties);
  };

  // Add a new custom property
  const addProperty = () => {
    const newProperty = {
      property: '',
      value: '',
      _type: 'string'
    };
    updateField([...formData.customProperties, newProperty]);
  };

  // Remove a custom property
  const removeProperty = (index) => {
    const updatedProperties = formData.customProperties.filter((_, i) => i !== index);
    updateField(updatedProperties);
  };

  // Get string representation of value for editing
  const getValueString = (prop) => {
    const type = prop._type || detectType(prop.value);
    if (type === 'array' || type === 'object') {
      return JSON.stringify(prop.value, null, 2);
    }
    if (type === 'boolean') {
      if (prop.value === true) return 'true';
      if (prop.value === false) return 'false';
      return '';
    }
    return prop.value?.toString() || '';
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900 mb-3">Custom Properties</h3>
            <p className="mt-1 text-xs leading-4 text-gray-500 mb-4">
              A list of key/value pairs for custom properties. Names should be in camel case.
            </p>

            <div>
              <label className="block text-xs font-medium leading-4 text-gray-900 mb-2">
                Properties
              </label>

              {formData.customProperties.length > 0 && (
                <div className="mb-2 space-y-2">
                  {formData.customProperties.map((prop, index) => {
                    const type = prop._type || detectType(prop.value);
                    const inputClasses = "w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs";
                    return (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 space-y-1.5 border border-gray-200">
                        {/* Property, Value, and Remove button in one line */}
                        <div className="grid grid-cols-12 gap-2 items-end">
                          <div className="col-span-4">
                            <label className="block text-xs font-medium text-gray-700 mb-0.5">Property</label>
                            <input
                              type="text"
                              value={prop.property || ''}
                              onChange={(e) => updateProperty(index, 'property', e.target.value)}
                              className={inputClasses}
                              placeholder="myCustomProperty"
                            />
                          </div>
                          <div className="col-span-7">
                            <label className="block text-xs font-medium text-gray-700 mb-0.5">Value</label>
                            {type === 'boolean' ? (
                              <select
                                value={prop.value === true ? 'true' : prop.value === false ? 'false' : ''}
                                onChange={(e) => updateProperty(index, 'value', e.target.value)}
                                className={inputClasses}
                              >
                                <option value="">Not set</option>
                                <option value="false">false</option>
                                <option value="true">true</option>
                              </select>
                            ) : type === 'number' ? (
                              <input
                                type="number"
                                step="any"
                                value={prop.value ?? ''}
                                onChange={(e) => updateProperty(index, 'value', e.target.value)}
                                className={inputClasses}
                                placeholder="123"
                              />
                            ) : (
                              <input
                                type="text"
                                value={type === 'array' || type === 'object' ? JSON.stringify(prop.value) : (prop.value || '')}
                                onChange={(e) => updateProperty(index, 'value', e.target.value)}
                                className={inputClasses}
                                placeholder="Enter value..."
                              />
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeProperty(index)}
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
                            value={prop.description || ''}
                            onChange={(e) => updateProperty(index, 'description', e.target.value)}
                            className={inputClasses}
                            placeholder="Describe this property..."
                            rows={2}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Always show add button */}
              <button
                type="button"
                onClick={addProperty}
                className="w-full px-2 py-1 border-2 border-dashed border-gray-300 rounded text-xs text-gray-600 hover:border-indigo-400 hover:text-indigo-600"
              >
                + Add Property
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomProperties;
