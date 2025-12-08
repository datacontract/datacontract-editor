import { useEditorStore } from '../store.js';
import { Combobox, Tooltip } from '../components/ui/index.js';
import ValidatedInput from '../components/ui/ValidatedInput.jsx';
import QuestionMarkCircleIcon from '../components/ui/icons/QuestionMarkCircleIcon.jsx';
import {useShallow} from "zustand/react/shallow";

const ServiceLevelAgreement = () => {
	const slaProperties = useEditorStore(useShallow((state) => state.getValue('slaProperties'))) || [];
	const setValue = useEditorStore(useShallow((state) => state.setValue));

  const driverOptions = [
    { id: 'regulatory', name: 'regulatory' },
    { id: 'analytics', name: 'analytics' },
    { id: 'operational', name: 'operational' }
  ];

  // Update YAML when form fields change
  const updateField = (value) => {
    try {
      if (value) {
				setValue('slaProperties', value);
      }
    } catch (error) {
      console.error('Error updating YAML:', error);
    }
  };

  // Update a specific SLA
  const updateSLA = (index, field, value) => {
    const updatedSLAs = [...slaProperties];

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
    updateField([...slaProperties, newSLA]);
  };

  // Remove an SLA
  const removeSLA = (index) => {
    const updatedSLAs = slaProperties.filter((_, i) => i !== index);
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
              {/* Display existing SLAs */}
              {slaProperties?.length > 0 && (
                <div className="space-y-3 mb-2">
                  {slaProperties.map((sla, index) => (
                    <div key={index} className="border border-gray-300 rounded-md p-3 bg-gray-50">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <ValidatedInput
                          name={`sla-property-${index}`}
                          label="Property"
                          value={sla?.property || ''}
                          onChange={(e) => updateSLA(index, 'property', e.target.value)}
                          required={true}
                          className="bg-white"
                          tooltip="SLA metric identifier"
                          placeholder="latency"
                        />
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <label className="block text-xs font-medium leading-4 text-gray-900">
                              Value
                            </label>
                            <Tooltip content="Target commitment value">
                              <QuestionMarkCircleIcon />
                            </Tooltip>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={sla?.value ?? ''}
                              onChange={(e) => updateSLA(index, 'value', e.target.value)}
                              className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                              placeholder="100"
                            />
                            <button
                              type="button"
                              onClick={() => removeSLA(index)}
                              className="p-1.5 text-gray-400 cursor-pointer border border-gray-300 rounded hover:text-red-400 hover:border-red-400 transition-colors flex-shrink-0"
                              title="Remove SLA"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <label className="block text-xs font-medium leading-4 text-gray-900">
                              Unit
                            </label>
                            <Tooltip content="Measurement standard (ISO format: d/day/days, y/yr/years)">
                              <QuestionMarkCircleIcon />
                            </Tooltip>
                          </div>
                          <input
                            type="text"
                            value={sla?.unit || ''}
                            onChange={(e) => updateSLA(index, 'unit', e.target.value)}
                            className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                            placeholder="ms"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <label className="block text-xs font-medium leading-4 text-gray-900">
                              Element
                            </label>
                            <Tooltip content="Target schema component(s)">
                              <QuestionMarkCircleIcon />
                            </Tooltip>
                          </div>
                          <input
                            type="text"
                            value={sla?.element || ''}
                            onChange={(e) => updateSLA(index, 'element', e.target.value)}
                            className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                            placeholder="table_name"
                          />
                        </div>
                        <div>
                          <Combobox
                            label={
                              <div className="flex items-center gap-1">
                                <span>Driver</span>
                                <Tooltip content="Priority classification">
                                  <QuestionMarkCircleIcon />
                                </Tooltip>
                              </div>
                            }
                            options={driverOptions}
                            value={sla?.driver || ''}
                            onChange={(selectedValue) => updateSLA(index, 'driver', selectedValue || '')}
                            placeholder="Select driver..."
                            acceptAnyInput={true}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <label className="block text-xs font-medium leading-4 text-gray-900">
                              Scheduler
                            </label>
                            <Tooltip content="Name of the scheduler (e.g., cron or any tool your organization supports)">
                              <QuestionMarkCircleIcon />
                            </Tooltip>
                          </div>
                          <input
                            type="text"
                            value={sla?.scheduler || ''}
                            onChange={(e) => updateSLA(index, 'scheduler', e.target.value)}
                            className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                            placeholder="cron"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <label className="block text-xs font-medium leading-4 text-gray-900">
                              Schedule
                            </label>
                            <Tooltip content="Configuration for the scheduling tool (e.g., 0 20 * * * for cron)">
                              <QuestionMarkCircleIcon />
                            </Tooltip>
                          </div>
                          <input
                            type="text"
                            value={sla?.schedule || ''}
                            onChange={(e) => updateSLA(index, 'schedule', e.target.value)}
                            className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                            placeholder="0 20 * * *"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <div className="flex items-center gap-1 mb-1">
                            <label className="block text-xs font-medium leading-4 text-gray-900">
                              Description
                            </label>
                            <Tooltip content="Human-readable explanation">
                              <QuestionMarkCircleIcon />
                            </Tooltip>
                          </div>
                          <textarea
                            rows={2}
                            value={sla?.description || ''}
                            onChange={(e) => updateSLA(index, 'description', e.target.value)}
                            className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                            placeholder="Human-readable explanation..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Always show add button */}
              <button
                type="button"
                onClick={addSLA}
                className="w-full px-2 py-1 border-2 border-dashed border-gray-300 rounded text-xs text-gray-600 hover:border-indigo-400 hover:text-indigo-600"
              >
                + Add SLA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceLevelAgreement;
