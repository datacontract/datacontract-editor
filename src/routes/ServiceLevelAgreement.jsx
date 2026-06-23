import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useEditorStore } from '../store.js';
import { Combobox, Tooltip } from '../components/ui/index.js';
import ValidatedInput from '../components/ui/ValidatedInput.jsx';
import QuestionMarkCircleIcon from '../components/ui/icons/QuestionMarkCircleIcon.jsx';
import {useShallow} from "zustand/react/shallow";

const ServiceLevelAgreement = () => {
	const { t } = useTranslation();
	const slaProperties = useEditorStore(useShallow((state) => state.getValue('slaProperties'))) || [];
	const setValue = useEditorStore(useShallow((state) => state.setValue));
	const schema = useEditorStore(useShallow((state) => state.getValue('schema'))) || [];

  // Generate schema.property suggestions from schema
  const schemaPropertySuggestions = useMemo(() => {
    const suggestions = [];

    schema.forEach((schemaItem) => {
      if (!schemaItem?.name) return;

      // Add property-level suggestions (schema.property format)
      if (schemaItem.properties && Array.isArray(schemaItem.properties)) {
        schemaItem.properties.forEach((prop) => {
          if (prop?.name) {
            const fullPath = `${schemaItem.name}.${prop.name}`;
            suggestions.push({
              id: fullPath,
              name: fullPath,
              label: fullPath,
              schemaName: schemaItem.name,
              propertyName: prop.name
            });
          }
        });
      }
    });

    return suggestions;
  }, [schema]);

  const driverOptions = [
    { id: 'regulatory', name: 'regulatory' },
    { id: 'analytics', name: 'analytics' },
    { id: 'operational', name: 'operational' }
  ];

  // Update YAML when form fields change
  const updateField = (value) => {
    try {
      setValue('slaProperties', value && value.length > 0 ? value : undefined);
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
            <h3 className="text-base font-semibold leading-6 text-gray-900">{t('sla.heading')}</h3>
            <p className="mt-1 text-xs leading-4 text-gray-500 mb-4">
              {t('sla.description')}
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
                          label={t('sla.property.label')}
                          value={sla?.property || ''}
                          onChange={(e) => updateSLA(index, 'property', e.target.value)}
                          required={true}
                          className="bg-white"
                          tooltip={t('sla.property.tooltip')}
                          placeholder="latency"
                          validationKey={`sla.${index}.property`}
                          validationSection="SLA"
                        />
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <label className="block text-xs font-medium leading-4 text-gray-900">
                              {t('sla.value.label')}
                            </label>
                            <Tooltip content={t('sla.value.tooltip')}>
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
                              title={t('sla.remove')}
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
                              {t('sla.unit.label')}
                            </label>
                            <Tooltip content={t('sla.unit.tooltip')}>
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
                          <Combobox
                            label={
                              <div className="flex items-center gap-1">
                                <span>{t('sla.element.label')}</span>
                                <Tooltip content={t('sla.element.tooltip')}>
                                  <QuestionMarkCircleIcon />
                                </Tooltip>
                              </div>
                            }
                            options={schemaPropertySuggestions}
                            value={sla?.element || ''}
                            onChange={(selectedValue) => updateSLA(index, 'element', selectedValue || '')}
                            placeholder="schema.property"
                            acceptAnyInput={true}
                            filterKey="name"
                            displayValue={(opt) => opt?.name || opt || ''}
                          />
                        </div>
                        <div>
                          <Combobox
                            label={
                              <div className="flex items-center gap-1">
                                <span>{t('sla.driver.label')}</span>
                                <Tooltip content={t('sla.driver.tooltip')}>
                                  <QuestionMarkCircleIcon />
                                </Tooltip>
                              </div>
                            }
                            options={driverOptions}
                            value={sla?.driver || ''}
                            onChange={(selectedValue) => updateSLA(index, 'driver', selectedValue || '')}
                            placeholder={t('sla.driver.placeholder')}
                            acceptAnyInput={true}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <label className="block text-xs font-medium leading-4 text-gray-900">
                              {t('sla.scheduler.label')}
                            </label>
                            <Tooltip content={t('sla.scheduler.tooltip')}>
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
                              {t('sla.schedule.label')}
                            </label>
                            <Tooltip content={t('sla.schedule.tooltip')}>
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
                              {t('sla.descriptionField.label')}
                            </label>
                            <Tooltip content={t('sla.descriptionField.tooltip')}>
                              <QuestionMarkCircleIcon />
                            </Tooltip>
                          </div>
                          <textarea
                            rows={2}
                            value={sla?.description || ''}
                            onChange={(e) => updateSLA(index, 'description', e.target.value)}
                            className="block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4"
                            placeholder={t('sla.descriptionField.placeholder')}
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
                {t('sla.add')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceLevelAgreement;
