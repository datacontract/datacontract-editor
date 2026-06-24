import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useEditorStore } from '../../store.js';
import { getSchemaEnumValues } from '../../lib/schemaEnumExtractor.js';
import ValidatedCombobox from './ValidatedCombobox.jsx';
import ChevronDownIcon from './icons/ChevronDownIcon.jsx';
import ChevronRightIcon from './icons/ChevronRightIcon.jsx';

/**
 * QualityEditor - Custom component for editing ODCS 3.1.0 quality rules
 * Provides a smart interface that shows relevant fields based on quality type
 */
const QualityEditor = ({ value, onChange, context = 'property', label, helpText }) => {
  const { t } = useTranslation();
  const jsonSchema = useEditorStore((state) => state.schemaData);
  const resolvedLabel = label || t('quality.label');

  // Get dynamic enum values from schema
  const qualityDimensionOptions = useMemo(() => {
    return getSchemaEnumValues(jsonSchema, 'quality.dimension', context) ||
           ['accuracy', 'completeness', 'conformity', 'consistency', 'coverage', 'timeliness', 'uniqueness'];
  }, [jsonSchema, context]);

  const rules = Array.isArray(value) ? value : [];

  const addRule = () => {
    const newRule = { type: 'library' };
    onChange([...rules, newRule]);
  };

  const updateRule = (index, field, fieldValue) => {
    const updatedRules = [...rules];
    if (fieldValue === undefined || fieldValue === '') {
      delete updatedRules[index][field];
    } else {
      updatedRules[index][field] = fieldValue;
    }
    onChange(updatedRules);
  };

  const removeRule = (index) => {
    const updatedRules = rules.filter((_, i) => i !== index);
    onChange(updatedRules.length > 0 ? updatedRules : undefined);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-700">{resolvedLabel}</label>
        <button
          type="button"
          onClick={addRule}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
        >
          + {t('quality.add')}
        </button>
      </div>

      {rules.map((rule, index) => (
        <QualityRuleCard
          key={index}
          rule={rule}
          index={index}
          dimensionOptions={qualityDimensionOptions}
          onUpdate={updateRule}
          onRemove={removeRule}
          context={context}
        />
      ))}

      {rules.length === 0 && (
        <div className="text-xs text-gray-500 italic">{t('quality.empty')}</div>
      )}

      {helpText && (
        <p className="text-xs text-gray-500 mt-1">{helpText}</p>
      )}
    </div>
  );
};

const QualityRuleCard = ({ rule, index, dimensionOptions, onUpdate, onRemove, context }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAdditionalDetailsExpanded, setIsAdditionalDetailsExpanded] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const ruleType = rule.type || 'library';

  // Determine which fields to show based on type
  const showLibraryFields = ruleType === 'library';
  const showSqlFields = ruleType === 'sql';
  const showCustomFields = ruleType === 'custom';
  const showOperators = showLibraryFields || showSqlFields;

  // Operator definitions
  const operatorOptions = [
    { value: 'mustBe', label: t('quality.operator.mustBe'), symbol: '=' },
    { value: 'mustNotBe', label: t('quality.operator.mustNotBe'), symbol: '≠' },
    { value: 'mustBeGreaterThan', label: t('quality.operator.mustBeGreaterThan'), symbol: '>' },
    { value: 'mustBeGreaterOrEqualTo', label: t('quality.operator.mustBeGreaterOrEqualTo'), symbol: '≥' },
    { value: 'mustBeLessThan', label: t('quality.operator.mustBeLessThan'), symbol: '<' },
    { value: 'mustBeLessOrEqualTo', label: t('quality.operator.mustBeLessOrEqualTo'), symbol: '≤' }
  ];

  // Initialize selected operator from rule data on mount and when rule changes
  useEffect(() => {
    const operators = operatorOptions.map(op => op.value);
    const activeOperators = operators.filter(op => rule[op] !== undefined && rule[op] !== '');

    if (activeOperators.length > 0) {
      // Keep first operator if multiple are defined
      setSelectedOperator(activeOperators[0]);

      // Clear other operators if multiple exist (migration logic)
      if (activeOperators.length > 1) {
        activeOperators.slice(1).forEach(op => {
          onUpdate(index, op, undefined);
        });
      }
    } else {
      setSelectedOperator(null);
    }
  }, [rule.mustBe, rule.mustNotBe, rule.mustBeGreaterThan, rule.mustBeGreaterOrEqualTo, rule.mustBeLessThan, rule.mustBeLessOrEqualTo]);

  // Handle operator selection change
  const handleOperatorChange = (newOperator) => {
    // Clear all other operators
    operatorOptions.forEach(op => {
      if (op.value !== newOperator) {
        onUpdate(index, op.value, undefined);
      }
    });
    setSelectedOperator(newOperator);
  };

  // Handle operator value change
  const handleOperatorValueChange = (value) => {
    if (selectedOperator) {
      onUpdate(index, selectedOperator, value);
    }
  };

  // Generate a summary of the rule
  const getSummary = () => {
    const parts = [];
    if (rule.name) parts.push(rule.name);
    if (rule.metric) parts.push(`${t('quality.summary.metric')}: ${rule.metric}`);
    if (rule.dimension) parts.push(`${t('quality.summary.dimension')}: ${rule.dimension}`);

    // Show operator summary with actual symbol and value
    const activeOps = operatorOptions.filter(op => rule[op.value] !== undefined);
    activeOps.forEach(op => {
      parts.push(`${op.value} ${rule[op.value]}${rule.unit === 'percent' ? '%' : ''}`);
    });

    return parts.length > 0 ? parts.join(' • ') : t('quality.summary.new');
  };

  return (
    <div className="border border-gray-200 rounded-md bg-white">
      {/* Header - Always visible */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-indigo-600 uppercase">{ruleType}</span>
            {rule.dimension && (
              <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded">
                {rule.dimension}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-600 mt-0.5 truncate">{getSummary()}</div>
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
          {/* Core Fields - Always shown */}
          <div className="grid grid-cols-12 gap-3 items-end">
            <div className="col-span-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('quality.type.label')}</label>
              <select
                value={rule.type || ''}
                onChange={(e) => onUpdate(index, 'type', e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
              >
                <option value="">{t('quality.select')}</option>
                <option value="text">{t('quality.type.text')}</option>
                <option value="library">{t('quality.type.library')}</option>
                <option value="sql">{t('quality.type.sql')}</option>
                <option value="custom">{t('quality.type.custom')}</option>
              </select>
            </div>

            <div className="col-span-7">
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('quality.name.label')}</label>
              <input
                type="text"
                value={rule.name || ''}
                onChange={(e) => onUpdate(index, 'name', e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                placeholder={t('quality.name.placeholder')}
              />
            </div>

            <button
              type="button"
              onClick={() => onRemove(index)}
              className="p-1 text-gray-400 cursor-pointer border border-gray-300 rounded hover:text-red-400 hover:border-red-400 transition-colors justify-self-end"
              title={t('quality.remove')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{t('quality.description.label')}</label>
            <textarea
              value={rule.description || ''}
              onChange={(e) => onUpdate(index, 'description', e.target.value)}
              rows={2}
              className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
              placeholder={t('quality.description.placeholder')}
            />
          </div>

          {/* Library-specific fields */}
          {showLibraryFields && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('quality.metric.label')}</label>
                <select
                  value={rule.metric || ''}
                  onChange={(e) => onUpdate(index, 'metric', e.target.value)}
                  className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                >
                  <option value="">{t('quality.metric.placeholder')}</option>
                  <option value="nullValues">nullValues</option>
                  <option value="missingValues">missingValues</option>
                  <option value="invalidValues">invalidValues</option>
                  <option value="duplicateValues">duplicateValues</option>
                  <option value="rowCount">rowCount</option>
                </select>
              </div>

              {/* Metric-specific arguments */}
              {rule.metric === 'missingValues' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{t('quality.missingValues.label')}</label>
                  <textarea
                    value={rule.arguments?.missingValues?.join('\n') || ''}
                    onChange={(e) => {
                      const values = e.target.value.split('\n');
                      const updatedArguments = values.length > 0 && values.some(v => v.trim() !== '') ? { ...rule.arguments, missingValues: values } : undefined;
                      onUpdate(index, 'arguments', updatedArguments);
                    }}
                    rows={3}
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs font-mono"
                    placeholder="null&#10;&#10;N/A&#10;n/a"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('quality.missingValues.help')}</p>
                </div>
              )}

              {rule.metric === 'invalidValues' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {t('quality.validValues.label')} <span className="text-gray-500">{t('quality.validValues.orPattern')}</span>
                    </label>
                    <textarea
                      value={rule.arguments?.validValues?.join('\n') || ''}
                      onChange={(e) => {
                        const values = e.target.value.split('\n');
                        let updatedArguments = { ...rule.arguments };
                        if (values.length > 0 && values.some(v => v.trim() !== '')) {
                          updatedArguments.validValues = values;
                          delete updatedArguments.pattern;
                        } else {
                          delete updatedArguments.validValues;
                        }
                        onUpdate(index, 'arguments', Object.keys(updatedArguments).length > 0 ? updatedArguments : undefined);
                      }}
                      rows={3}
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs font-mono"
                      placeholder="pounds&#10;kg"
                    />
                    <p className="text-xs text-gray-500 mt-1">{t('quality.validValues.help')}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      <span className="text-gray-500">{t('quality.pattern.validValuesOr')}</span> {t('quality.pattern.label')}
                    </label>
                    <input
                      type="text"
                      value={rule.arguments?.pattern || ''}
                      onChange={(e) => {
                        let updatedArguments = { ...rule.arguments };
                        if (e.target.value) {
                          updatedArguments.pattern = e.target.value;
                          delete updatedArguments.validValues;
                        } else {
                          delete updatedArguments.pattern;
                        }
                        onUpdate(index, 'arguments', Object.keys(updatedArguments).length > 0 ? updatedArguments : undefined);
                      }}
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs font-mono"
                      placeholder="^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$"
                    />
                    <p className="text-xs text-gray-500 mt-1">{t('quality.pattern.help')}</p>
                  </div>
                </div>
              )}

              {rule.metric === 'duplicateValues' && context === 'schema' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{t('quality.properties.label')}</label>
                  <textarea
                    value={rule.arguments?.properties?.join('\n') || ''}
                    onChange={(e) => {
                      const values = e.target.value.split('\n');
                      const updatedArguments = values.length > 0 && values.some(v => v.trim() !== '') ? { ...rule.arguments, properties: values } : undefined;
                      onUpdate(index, 'arguments', updatedArguments);
                    }}
                    rows={3}
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs font-mono"
                    placeholder="tenant_id&#10;order_id"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t('quality.properties.help')}</p>
                </div>
              )}
            </div>
          )}

          {/* SQL-specific fields */}
          {showSqlFields && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('quality.sqlQuery.label')}</label>
              <textarea
                value={rule.query || ''}
                onChange={(e) => onUpdate(index, 'query', e.target.value)}
                rows={4}
                className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs font-mono"
                placeholder="SELECT COUNT(*) FROM {object} WHERE..."
              />
              <p className="text-xs text-gray-500 mt-1">{t('quality.sqlQuery.hint', { object: '{object}', property: '{property}' })}</p>
            </div>
          )}

          {/* Custom-specific fields */}
          {showCustomFields && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('quality.engine.label')}</label>
                <input
                  type="text"
                  value={rule.engine || ''}
                  onChange={(e) => onUpdate(index, 'engine', e.target.value)}
                  className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                  placeholder={t('quality.engine.placeholder')}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('quality.implementation.label')}</label>
                <textarea
                  value={rule.implementation || ''}
                  onChange={(e) => onUpdate(index, 'implementation', e.target.value)}
                  rows={4}
                  className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs font-mono"
                  placeholder={t('quality.implementation.placeholder')}
                />
              </div>
            </div>
          )}

          {/* Comparison Operators - Only for library and sql types */}
          {showOperators && (
            <div className="mt-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <ValidatedCombobox
                    name="operator"
                    label={t('quality.operator.label')}
                    options={operatorOptions.map(op => ({ id: op.value, name: op.label }))}
                    value={selectedOperator || ''}
                    onChange={handleOperatorChange}
                    placeholder={t('quality.operator.placeholder')}
                    required={true}
                    acceptAnyInput={false}
                    displayValue={(val) => {
                      if (val && typeof val === 'object') return val.name || '';
                      const found = operatorOptions.find(o => o.value === val);
                      return found ? found.label : val || '';
                    }}
                    validationKey={`quality.${index}.operator`}
                    validationSection="Quality"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{t('quality.value.label')}</label>
                  <input
                    type="number"
                    value={selectedOperator ? (rule[selectedOperator] ?? '') : ''}
                    onChange={(e) => handleOperatorValueChange(e.target.value ? Number(e.target.value) : undefined)}
                    disabled={!selectedOperator}
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed text-xs"
                    placeholder={selectedOperator ? t('quality.value.placeholder') : t('quality.value.placeholderDisabled')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{t('quality.unit.label')}</label>
                  <select
                    value={rule.unit || ''}
                    onChange={(e) => onUpdate(index, 'unit', e.target.value)}
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                  >
                    <option value="">{t('quality.unit.default')}</option>
                    <option value="rows">rows</option>
                    <option value="percent">percent</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Additional Details - Expandable */}
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setIsAdditionalDetailsExpanded(!isAdditionalDetailsExpanded)}
              className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded bg-gray-50"
            >
              <h4 className="text-xs font-medium text-gray-700">{t('quality.additionalDetails')}</h4>
              <ChevronDownIcon
                className={`h-4 w-4 text-gray-500 transition-transform ${isAdditionalDetailsExpanded ? 'rotate-180' : ''}`}
              />
            </button>

            {isAdditionalDetailsExpanded && (
              <div className="space-y-3 mt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{t('quality.dimension.label')}</label>
                    <select
                      value={rule.dimension || ''}
                      onChange={(e) => onUpdate(index, 'dimension', e.target.value)}
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                    >
                      <option value="">{t('quality.select')}</option>
                      {dimensionOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{t('quality.severity.label')}</label>
                    <input
                      type="text"
                      value={rule.severity || ''}
                      onChange={(e) => onUpdate(index, 'severity', e.target.value)}
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                      placeholder={t('quality.severity.placeholder')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{t('quality.businessImpact.label')}</label>
                  <textarea
                    value={rule.businessImpact || ''}
                    onChange={(e) => onUpdate(index, 'businessImpact', e.target.value)}
                    rows={2}
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                    placeholder={t('quality.businessImpact.placeholder')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{t('quality.scheduler.label')}</label>
                    <input
                      type="text"
                      value={rule.scheduler || ''}
                      onChange={(e) => onUpdate(index, 'scheduler', e.target.value)}
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                      placeholder={t('quality.scheduler.placeholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{t('quality.schedule.label')}</label>
                    <input
                      type="text"
                      value={rule.schedule || ''}
                      onChange={(e) => onUpdate(index, 'schedule', e.target.value)}
                      className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                      placeholder="e.g., 0 20 * * *"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default QualityEditor;
