import { useMemo } from 'react';
import { useEditorStore } from '../store.js';
import { Combobox, Tooltip } from '../components/ui/index.js';
import ValidatedInput from '../components/ui/ValidatedInput.jsx';
import QuestionMarkCircleIcon from '../components/ui/icons/QuestionMarkCircleIcon.jsx';
import * as YAML from 'yaml';

const ServiceLevelAgreement = () => {
  const yaml = useEditorStore((state) => state.yaml);
  const setYaml = useEditorStore((state) => state.setYaml);
  const currentView = useEditorStore((state) => state.currentView);

  const driverOptions = [
    { id: 'regulatory', name: 'regulatory' },
    { id: 'analytics', name: 'analytics' },
    { id: 'operational', name: 'operational' }
  ];

  // Parse current YAML to extract form values
  const formData = useMemo(() => {
    if (!yaml?.trim()) {
      return { slas: [] };
    }

    try {
      const parsed = YAML.parse(yaml);
      return {
        slas: parsed.slaProperties || []
      };
    } catch {
      return { slas: [] };
    }
  }, [yaml]);

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
        parsed.slaProperties = value;
      } else {
        delete parsed.slaProperties;
      }

      // Convert back to YAML
      const newYaml = YAML.stringify(parsed);
      setYaml(newYaml);
    } catch (error) {
      console.error('Error updating YAML:', error);
    }
  };

  // Update a specific SLA
  const updateSLA = (index, field, value) => {
    const updatedSLAs = [...formData.slas];

    // Handle value type conversions
    let processedValue = value;
    if (field === 'value') {
      // Try to parse as number, otherwise keep as string
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && value !== '') {
        processedValue = numValue;
      } else if (value === 'true' || value === 'false') {
        processedValue = value === 'true';
      } else {
        processedValue = value || undefined;
      }
    } else {
      processedValue = value || undefined;
    }

    updatedSLAs[index] = {
      ...updatedSLAs[index],
      [field]: processedValue
    };
    updateField(updatedSLAs);
  };

  // Add a new SLA
  const addSLA = () => {
    const newSLA = {
      property: '',
      value: ''
    };
    updateField([...formData.slas, newSLA]);
  };

  // Remove an SLA
  const removeSLA = (index) => {
    const updatedSLAs = formData.slas.filter((_, i) => i !== index);
    updateField(updatedSLAs);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900 mb-3">Service Level Agreement</h3>
            <p className="mt-1 text-xs leading-4 text-gray-500 mb-4">
              Performance and availability commitments with enforcement parameters.
            </p>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-medium leading-4 text-gray-900">
                  SLA Metrics
                </label>
                <button
                  type="button"
                  onClick={addSLA}
                  className="inline-flex items-center rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Add SLA
                </button>
              </div>

              {formData.slas.length === 0 ? (
                <div className="text-center py-4 text-xs text-gray-500 bg-gray-50 rounded-md border border-gray-200">
                  No SLAs added yet. Click "Add SLA" to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.slas.map((sla, index) => (
                    <div key={index} className="border border-gray-300 rounded-md p-3 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-medium text-gray-700">SLA {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeSLA(index)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <ValidatedInput
                          name={`sla-property-${index}`}
                          label="Property"
                          value={sla.property || ''}
                          onChange={(e) => updateSLA(index, 'property', e.target.value)}
                          required={true}
                          tooltip="SLA metric identifier"
                          placeholder="latency"
                        />
                        <ValidatedInput
                          name={`sla-value-${index}`}
                          label="Value"
                          value={sla.value ?? ''}
                          onChange={(e) => updateSLA(index, 'value', e.target.value)}
                          required={true}
                          tooltip="Target commitment value"
                          placeholder="100"
                        />
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <label className="block text-xs font-medium leading-4 text-gray-900">
                              Unit
                            </label>
                            <Tooltip content="Measurement standard (ISO format: d/day/days, y/yr/years)">
                              <QuestionMarkCircleIcon className="w-3.5 h-3.5 text-gray-400" />
                            </Tooltip>
                          </div>
                          <input
                            type="text"
                            value={sla.unit || ''}
                            onChange={(e) => updateSLA(index, 'unit', e.target.value)}
                            className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                            placeholder="ms"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <label className="block text-xs font-medium leading-4 text-gray-900">
                              Element
                            </label>
                            <Tooltip content="Target schema component(s)">
                              <QuestionMarkCircleIcon className="w-3.5 h-3.5 text-gray-400" />
                            </Tooltip>
                          </div>
                          <input
                            type="text"
                            value={sla.element || ''}
                            onChange={(e) => updateSLA(index, 'element', e.target.value)}
                            className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                            placeholder="table_name"
                          />
                        </div>
                        <div>
                          <Combobox
                            label={
                              <div className="flex items-center gap-1">
                                <span>Driver</span>
                                <Tooltip content="Priority classification">
                                  <QuestionMarkCircleIcon className="w-3.5 h-3.5 text-gray-400" />
                                </Tooltip>
                              </div>
                            }
                            options={driverOptions}
                            value={sla.driver || ''}
                            onChange={(selectedValue) => updateSLA(index, 'driver', selectedValue || '')}
                            placeholder="Select driver..."
                            acceptAnyInput={true}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <div className="flex items-center gap-1 mb-1">
                            <label className="block text-xs font-medium leading-4 text-gray-900">
                              Description
                            </label>
                            <Tooltip content="Human-readable explanation">
                              <QuestionMarkCircleIcon className="w-3.5 h-3.5 text-gray-400" />
                            </Tooltip>
                          </div>
                          <textarea
                            rows={2}
                            value={sla.description || ''}
                            onChange={(e) => updateSLA(index, 'description', e.target.value)}
                            className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                            placeholder="Human-readable explanation..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceLevelAgreement;
