import { useMemo } from 'react';
import { useEditorStore } from '../store.js';
import { Combobox, Tooltip } from '../components/ui/index.js';
import QuestionMarkCircleIcon from '../components/ui/icons/QuestionMarkCircleIcon.jsx';
import ChevronDownIcon from '../components/ui/icons/ChevronDownIcon.jsx';
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
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-medium leading-4 text-gray-900">
                  Properties
                </label>
                <button
                  type="button"
                  onClick={addProperty}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Add Property
                </button>
              </div>

              {formData.customProperties.length === 0 ? (
                <div className="text-center py-4 text-xs text-gray-500 bg-gray-50 rounded-md border border-gray-200">
                  No custom properties added yet. Click "Add Property" to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.customProperties.map((prop, index) => {
                    const type = prop._type || detectType(prop.value);
                    return (
                      <div key={index} className="border border-gray-300 rounded-md p-3 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-medium text-gray-700">Property {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeProperty(index)}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div>
                            <div className="flex justify-between mb-1">
                              <div className="flex items-center gap-1">
                                <label className="block text-xs font-medium leading-4 text-gray-900">
                                  Property Name
                                </label>
                                <Tooltip content="The name of the key (use camelCase)">
                                  <QuestionMarkCircleIcon className="w-3.5 h-3.5 text-gray-400" />
                                </Tooltip>
                              </div>
                              <span className="text-xs leading-4 text-gray-500">Required</span>
                            </div>
                            <input
                              type="text"
                              value={prop.property || ''}
                              onChange={(e) => updateProperty(index, 'property', e.target.value)}
                              className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                              placeholder="myCustomProperty"
                            />
                          </div>
                          <div>
                            <Combobox
                              label={
                                <div className="flex items-center gap-1">
                                  <span>Type</span>
                                  <Tooltip content="Data type of the value">
                                    <QuestionMarkCircleIcon className="w-3.5 h-3.5 text-gray-400" />
                                  </Tooltip>
                                </div>
                              }
                              options={typeOptions}
                              value={type}
                              onChange={(selectedValue) => updateProperty(index, 'type', selectedValue || 'string')}
                              placeholder="Select type..."
                              acceptAnyInput={false}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <div className="flex justify-between mb-1">
                              <div className="flex items-center gap-1">
                                <label className="block text-xs font-medium leading-4 text-gray-900">
                                  Value
                                </label>
                                <Tooltip content={type === 'array' || type === 'object' ? 'Enter valid JSON' : 'Enter the value'}>
                                  <QuestionMarkCircleIcon className="w-3.5 h-3.5 text-gray-400" />
                                </Tooltip>
                              </div>
                              <span className="text-xs leading-4 text-gray-500">Required</span>
                            </div>
                            {type === 'boolean' ? (
                              <div className="grid grid-cols-1">
                                <select
                                  value={prop.value === true ? 'true' : prop.value === false ? 'false' : ''}
                                  onChange={(e) => updateProperty(index, 'value', e.target.value)}
                                  className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                                >
                                  <option value="">Not set</option>
                                  <option value="false">false</option>
                                  <option value="true">true</option>
                                </select>
                                <ChevronDownIcon
                                  aria-hidden="true"
                                  className="pointer-events-none col-start-1 row-start-1 mr-2 size-4 self-center justify-self-end text-gray-500"
                                />
                              </div>
                            ) : type === 'array' || type === 'object' ? (
                              <textarea
                                rows={4}
                                value={getValueString(prop)}
                                onChange={(e) => updateProperty(index, 'value', e.target.value)}
                                className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4 font-mono"
                                placeholder={type === 'array' ? '["value1", "value2"]' : '{"key": "value"}'}
                              />
                            ) : type === 'number' ? (
                              <input
                                type="number"
                                step="any"
                                value={prop.value ?? ''}
                                onChange={(e) => updateProperty(index, 'value', e.target.value)}
                                className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                                placeholder="123"
                              />
                            ) : (
                              <input
                                type="text"
                                value={prop.value || ''}
                                onChange={(e) => updateProperty(index, 'value', e.target.value)}
                                className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                                placeholder="Enter value..."
                              />
                            )}
                          </div>
                          <div className="sm:col-span-2">
                            <div className="flex items-center gap-1 mb-1">
                              <label className="block text-xs font-medium leading-4 text-gray-900">
                                Description
                              </label>
                              <Tooltip content="Description of the custom property">
                                <QuestionMarkCircleIcon className="w-3.5 h-3.5 text-gray-400" />
                              </Tooltip>
                            </div>
                            <textarea
                              rows={2}
                              value={prop.description || ''}
                              onChange={(e) => updateProperty(index, 'description', e.target.value)}
                              className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                              placeholder="Describe this property..."
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomProperties;
