import { useMemo, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as YAML from 'yaml';
import { useEditorStore } from '../../store.js';
import { getSchemaEnumValues } from '../../lib/schemaEnumExtractor.js';
import {
  argumentsOf,
  checkIdOf,
  countCustomQualityCheckProblems,
  customQualityCheckProblems,
  fillCheckDescription,
  findCustomQualityCheck,
  formatArguments,
  isPreDefinedRule,
} from '../../utils/customQualityChecks.js';
import Combobox from './Combobox.jsx';
import ValidatedCombobox from './ValidatedCombobox.jsx';
import ObjectYamlEditor from './ObjectYamlEditor.jsx';
import ChevronDownIcon from './icons/ChevronDownIcon.jsx';
import ChevronRightIcon from './icons/ChevronRightIcon.jsx';
import ExclamationCircleIcon from './icons/ExclamationCircleIcon.jsx';
import ExternalLinkIcon from './icons/ExternalLinkIcon.jsx';
import StableIdField from './StableIdField.jsx';

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const formatArgument = (value, type) => {
  if (value === undefined || value === null || value === '') return '';
  if (type === 'identifier' && typeof value === 'string') return value;
  return YAML.stringify(value, { collectionStyle: 'flow', flowCollectionPadding: false }).trimEnd();
};

// An argument's value as one auto-growing field: text for an identifier, else a YAML value such as 0, '0' or [a, b].
// Keeps its own text so half-typed YAML is not lost; an empty field reports undefined.
const ArgumentValueField = ({ value, type, onChange, placeholder, hasError, ariaLabel }) => {
  const { t } = useTranslation();
  const [text, setText] = useState(() => formatArgument(value, type));
  const [parseError, setParseError] = useState(null);
  const focusedRef = useRef(false);

  useEffect(() => {
    if (!focusedRef.current) {
      setText(formatArgument(value, type));
      setParseError(null);
    }
  }, [value, type]);

  const handleChange = (next) => {
    setText(next);
    if (next.trim() === '') {
      setParseError(null);
      onChange(undefined);
    } else if (type === 'identifier') {
      setParseError(null);
      onChange(next);
    } else {
      try {
        const parsed = YAML.parse(next);
        setParseError(null);
        onChange(parsed);
      } catch (e) {
        setParseError(e.message);
      }
    }
  };

  return (
    <div className="min-w-0 flex-1">
      <textarea
        rows={1}
        value={text}
        aria-label={ariaLabel}
        onFocus={() => { focusedRef.current = true; }}
        onBlur={() => { focusedRef.current = false; }}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className={`block w-full field-sizing-content resize-none rounded border bg-white px-2 py-1 shadow-sm text-xs ${hasError || parseError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'} ${type === 'identifier' ? 'font-mono' : ''}`}
      />
      {parseError && <p className="mt-1 text-xs text-red-600">{t('quality.customQualityCheck.invalidYaml', { message: parseError })}</p>}
    </div>
  );
};

/**
 * QualityEditor - Custom component for editing ODCS 3.1.0 quality rules
 * Provides a smart interface that shows relevant fields based on quality type
 */
const QualityEditor = ({ value, onChange, context = 'property', label, helpText, tableName, columnName, showProblemCount = true }) => {
  const { t } = useTranslation();
  const jsonSchema = useEditorStore((state) => state.schemaData);
  const customQualityChecks = useEditorStore((state) => state.editorConfig?.customQualityChecks ?? null);
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

  // Replaces the rule instead of mutating it, so the memoized preview sees the change. Several fields changing at
  // once go in one call as an object: a second call in the same event would start from the stale rules.
  const updateRule = (index, fieldOrChanges, fieldValue) => {
    const changes = typeof fieldOrChanges === 'object' ? fieldOrChanges : { [fieldOrChanges]: fieldValue };
    const updatedRule = { ...rules[index] };
    for (const [field, value] of Object.entries(changes)) {
      if (value === undefined || value === '') {
        delete updatedRule[field];
      } else {
        updatedRule[field] = value;
      }
    }
    onChange(rules.map((rule, i) => (i === index ? updatedRule : rule)));
  };

  const removeRule = (index) => {
    const updatedRules = rules.filter((_, i) => i !== index);
    onChange(updatedRules.length > 0 ? updatedRules : undefined);
  };

  const problemCount = showProblemCount ? countCustomQualityCheckProblems(rules, customQualityChecks, context) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <label className="text-xs font-medium text-gray-700">{resolvedLabel}</label>
          {problemCount > 0 && (
            <span className="rounded-full bg-red-100 px-1.5 text-[10px] font-semibold leading-4 text-red-700">
              {t('quality.customQualityCheck.problems', { count: problemCount })}
            </span>
          )}
        </span>
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
          siblingIds={rules.filter((_, i) => i !== index).map((r) => r?.id).filter(Boolean)}
          customQualityChecks={customQualityChecks}
          tableName={tableName}
          columnName={columnName}
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

const QualityRuleCard = ({ rule, index, dimensionOptions, onUpdate, onRemove, context, siblingIds, customQualityChecks, tableName, columnName }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAdditionalDetailsExpanded, setIsAdditionalDetailsExpanded] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [isAddingArgument, setIsAddingArgument] = useState(false);
  // Clearing the name deletes the key; the field must not vanish while it is being edited.
  const [hadName] = useState(() => rule.name !== undefined);
  const ruleType = rule.type || 'library';
  const preDefined = isPreDefinedRule(rule);

  // Determine which fields to show based on type
  const showLibraryFields = ruleType === 'library';
  const showSqlFields = ruleType === 'sql';
  const showCustomFields = ruleType === 'custom' && !preDefined;
  const showOperators = showLibraryFields || showSqlFields || preDefined;

  const checkId = checkIdOf(rule);
  const check = preDefined ? findCustomQualityCheck(customQualityChecks, checkId) : null;
  const args = argumentsOf(rule);
  const problems = customQualityCheckProblems(rule, customQualityChecks, context);
  const problemsFor = (field) => problems
    .filter((problem) => problem.field === field)
    .map((problem) => t(`quality.customQualityCheck.problem.${problem.key}`, problem.values));
  const checkExpectedResult = check?.expectedResult ?? null;
  const fillDescription = (target, values) => fillCheckDescription(target, values, { table: tableName, column: columnName });

  const handleTypeChange = (newType) => {
    if (newType === 'preDefined') {
      onUpdate(index, { type: 'custom', engine: 'datacontract-cli' });
    } else if (newType === 'custom' && preDefined) {
      onUpdate(index, 'engine', undefined);
    } else {
      onUpdate(index, 'type', newType);
    }
  };

  // A string implementation stays until a check is picked; then it becomes { check, arguments }.
  const updateImplementation = (changes) => {
    const implementation = rule.implementation && typeof rule.implementation === 'object' ? rule.implementation : {};
    const next = { ...implementation, ...changes };
    if (next.arguments && Object.keys(next.arguments).length === 0) delete next.arguments;
    onUpdate(index, 'implementation', next);
  };

  const setArgument = (name, value) => {
    const next = { ...args };
    if (value === undefined) {
      delete next[name];
    } else {
      next[name] = value;
    }
    updateImplementation({ arguments: next });
  };

  const renameArgument = (oldName, newName) => {
    if (!newName || newName === oldName || newName in args) return false;
    updateImplementation({ arguments: Object.fromEntries(Object.entries(args).map(([name, value]) => [name === oldName ? newName : name, value])) });
    return true;
  };

  const checkOptions = (customQualityChecks ?? []).map((option) => ({
    id: option.id,
    name: option.name || option.id,
    search: `${option.name ?? ''} ${option.id}`,
    description: fillDescription(option, {}),
    disabled: Boolean(option.usesColumn) && context !== 'property',
  }));
  const declaredArguments = check?.arguments ?? null;
  const undeclaredArgumentNames = declaredArguments
    ? Object.keys(args).filter((name) => !declaredArguments.some((argument) => argument.name === name))
    : [];

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
        onUpdate(index, Object.fromEntries(activeOperators.slice(1).map(op => [op, undefined])));
      }
    } else {
      setSelectedOperator(null);
    }
  }, [rule.mustBe, rule.mustNotBe, rule.mustBeGreaterThan, rule.mustBeGreaterOrEqualTo, rule.mustBeLessThan, rule.mustBeLessOrEqualTo]);

  // Handle operator selection change
  const handleOperatorChange = (newOperator) => {
    // Clear all other operators
    onUpdate(index, Object.fromEntries(operatorOptions.filter(op => op.value !== newOperator).map(op => [op.value, undefined])));
    setSelectedOperator(newOperator);
  };

  // A pre-defined rule without an operator of its own takes the check's when a value is typed.
  const checkOperator = preDefined && operatorOptions.some((op) => op.value === checkExpectedResult?.comparator)
    ? checkExpectedResult.comparator
    : null;

  // Handle operator value change
  const handleOperatorValueChange = (value) => {
    const operator = selectedOperator || checkOperator;
    if (operator) {
      onUpdate(index, operator, value);
    }
  };

  // Generate a summary of the rule
  const getSummary = () => {
    const parts = [];
    if (preDefined) {
      const name = rule.name || check?.name;
      if (name) parts.push(name);
      if (checkId) {
        parts.push(`${check?.id ?? checkId}(${formatArguments(args)})`);
      }
      if (!operatorOptions.some((op) => rule[op.value] !== undefined) && checkExpectedResult) {
        parts.push(`${checkExpectedResult.comparator} ${formatArgument(checkExpectedResult.value, 'any')}`);
      }
    } else if (rule.name) {
      parts.push(rule.name);
    }
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
            <span className="text-xs font-medium text-indigo-600 uppercase">{preDefined ? t('quality.type.preDefined') : ruleType}</span>
            {(rule.dimension || check?.dimension) && (
              <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded">
                {rule.dimension || check.dimension}
              </span>
            )}
            {problems.length > 0 && (
              <ExclamationCircleIcon className="h-3.5 w-3.5 text-red-600" role="img" aria-label={t('quality.customQualityCheck.hasProblem')} />
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
                value={preDefined ? 'preDefined' : (rule.type || '')}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
              >
                <option value="">{t('quality.select')}</option>
                <option value="text">{t('quality.type.text')}</option>
                <option value="library">{t('quality.type.library')}</option>
                <option value="sql">{t('quality.type.sql')}</option>
                <option value="preDefined">{t('quality.type.preDefined')}</option>
                <option value="custom">{t('quality.type.custom')}</option>
              </select>
            </div>

            <div className="col-span-7">
              {(!preDefined || hadName || rule.name !== undefined) && (
                <>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{t('quality.name.label')}</label>
                  <input
                    type="text"
                    value={rule.name || ''}
                    onChange={(e) => onUpdate(index, 'name', e.target.value)}
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
                    placeholder={check?.name || t('quality.name.placeholder')}
                  />
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => onRemove(index)}
              className="p-1 text-gray-400 cursor-pointer border border-gray-300 rounded hover:text-red-400 hover:border-red-400 transition-colors justify-self-end"
              title={t('quality.remove')}
            >
              <TrashIcon />
            </button>
          </div>

          {preDefined && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{t('quality.customQualityCheck.label')}</label>
              <div className="flex items-start gap-2">
                <Combobox
                  className="min-w-0 flex-1"
                  options={checkOptions}
                  value={check ? check.id : checkId}
                  onChange={(id) => updateImplementation({ check: id ?? '' })}
                  filterKey="search"
                  placeholder={customQualityChecks ? t('quality.customQualityCheck.placeholder') : t('quality.customQualityCheck.idPlaceholder')}
                  displayValue={(option) => (option.name === option.id ? option.id : `${option.name} · ${option.id}`)}
                  hasError={problemsFor('check').length > 0}
                  renderOption={(option) => (
                    <div className={option.disabled ? 'opacity-50' : ''}>
                      <div className="flex items-baseline gap-2">
                        <span className="truncate font-medium">{option.name}</span>
                        {option.name !== option.id && <span className="font-mono text-[11px] opacity-75">{option.id}</span>}
                        {option.disabled && <span className="ml-auto whitespace-nowrap text-[11px] opacity-75">{t('quality.customQualityCheck.onlyOnProperty')}</span>}
                      </div>
                      {option.description && <div className="mt-0.5 truncate opacity-75">{option.description}</div>}
                    </div>
                  )}
                />
                {customQualityChecks && (!check || check.href) && (check ? (
                  <a
                    href={check.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 p-1.5 text-gray-500 border border-gray-300 rounded hover:text-indigo-600 hover:border-indigo-400"
                    title={t('quality.customQualityCheck.open')}
                    aria-label={t('quality.customQualityCheck.open')}
                  >
                    <ExternalLinkIcon className="h-4 w-4" />
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="mt-1 p-1.5 text-gray-300 border border-gray-200 rounded bg-gray-50"
                    aria-label={t('quality.customQualityCheck.open')}
                  >
                    <ExternalLinkIcon className="h-4 w-4" />
                  </button>
                ))}
              </div>
              {problemsFor('check').map((message) => (
                <p key={message} className="mt-1 text-xs text-red-600">{message}</p>
              ))}
            </div>
          )}

          {preDefined && declaredArguments && (declaredArguments.length > 0 || undeclaredArgumentNames.length > 0) && (
            <div className="space-y-2">
              <span className="block text-xs font-medium text-gray-700">{t('quality.customQualityCheck.arguments')}</span>
              {declaredArguments.map((argument) => (
                <div key={argument.name}>
                  <div className="flex items-baseline gap-1 mb-1 text-xs text-gray-700">
                    <span className="font-mono">{argument.name}</span>
                    {argument.required && <span className="text-red-600">*</span>}
                    {argument.type !== 'any' && <span className="ml-auto text-gray-500">{argument.type}</span>}
                  </div>
                  <ArgumentValueField
                    value={args[argument.name]}
                    type={argument.type}
                    ariaLabel={argument.name}
                    placeholder={argument.default !== undefined && argument.default !== null
                      ? t('quality.customQualityCheck.defaultValue', { value: formatArgument(argument.default, 'any') })
                      : ''}
                    hasError={problemsFor(`arguments.${argument.name}`).length > 0}
                    onChange={(value) => setArgument(argument.name, value)}
                  />
                  {problemsFor(`arguments.${argument.name}`).map((message) => (
                    <p key={message} className="mt-1 text-xs text-red-600">{message}</p>
                  ))}
                </div>
              ))}
              {undeclaredArgumentNames.map((name) => (
                <div key={name}>
                  <div className="mb-1 text-xs text-gray-700 font-mono">{name}</div>
                  <div className="flex items-start gap-2">
                    <ArgumentValueField
                      value={args[name]}
                      type="any"
                      ariaLabel={name}
                      hasError
                      onChange={(value) => setArgument(name, value ?? '')}
                    />
                    <button
                      type="button"
                      onClick={() => setArgument(name, undefined)}
                      className="p-1 text-gray-400 cursor-pointer border border-gray-300 rounded hover:text-red-400 hover:border-red-400 transition-colors"
                      title={t('quality.customQualityCheck.removeArgument', { argument: name })}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                  {problemsFor(`arguments.${name}`).map((message) => (
                    <p key={message} className="mt-1 text-xs text-red-600">{message}</p>
                  ))}
                </div>
              ))}
            </div>
          )}

          {preDefined && !declaredArguments && (
            <div className="space-y-2">
              <span className="block text-xs font-medium text-gray-700">{t('quality.customQualityCheck.arguments')}</span>
              {Object.keys(args).map((name) => (
                <div key={name} className="flex items-start gap-2">
                  <input
                    type="text"
                    defaultValue={name}
                    aria-label={t('quality.customQualityCheck.argumentName')}
                    onBlur={(e) => {
                      if (!renameArgument(name, e.target.value.trim())) e.target.value = name;
                    }}
                    className="w-32 shrink-0 rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs font-mono"
                  />
                  <ArgumentValueField value={args[name]} type="any" ariaLabel={name} onChange={(value) => setArgument(name, value ?? '')} />
                  <button
                    type="button"
                    onClick={() => setArgument(name, undefined)}
                    className="p-1 text-gray-400 cursor-pointer border border-gray-300 rounded hover:text-red-400 hover:border-red-400 transition-colors"
                    title={t('quality.customQualityCheck.removeArgument', { argument: name })}
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}
              {isAddingArgument && (
                <div className="flex items-start gap-2">
                  <input
                    type="text"
                    autoFocus
                    aria-label={t('quality.customQualityCheck.argumentName')}
                    placeholder={t('quality.customQualityCheck.argumentName')}
                    onBlur={(e) => {
                      const name = e.target.value.trim();
                      if (name && !(name in args)) setArgument(name, '');
                      setIsAddingArgument(false);
                    }}
                    className="w-32 shrink-0 rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs font-mono"
                  />
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsAddingArgument(true)}
                className="w-full px-2 py-1 border-2 border-dashed border-gray-300 rounded text-xs text-gray-600 hover:border-indigo-400 hover:text-indigo-600"
              >
                {t('quality.customQualityCheck.addArgument')}
              </button>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{t('quality.description.label')}</label>
            <textarea
              value={rule.description || ''}
              onChange={(e) => onUpdate(index, 'description', e.target.value)}
              rows={2}
              className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs"
              placeholder={(check && fillDescription(check, args)) || t('quality.description.placeholder')}
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
                {rule.implementation && typeof rule.implementation === 'object' ? (
                  <ObjectYamlEditor
                    value={rule.implementation}
                    onChange={(value) => onUpdate(index, 'implementation', value)}
                    kind="object"
                    height={120}
                  />
                ) : (
                  <textarea
                    value={rule.implementation || ''}
                    onChange={(e) => onUpdate(index, 'implementation', e.target.value)}
                    rows={4}
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs font-mono"
                    placeholder={t('quality.implementation.placeholder')}
                  />
                )}
              </div>
            </div>
          )}

          {/* Comparison Operators - for library, sql and pre-defined types */}
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
                    placeholder={checkExpectedResult
                      ? t(`quality.operator.${checkExpectedResult.comparator}`, { defaultValue: checkExpectedResult.comparator })
                      : t('quality.operator.placeholder')}
                    required={!preDefined}
                    externalErrors={problemsFor('operator')}
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
                    disabled={!selectedOperator && !checkOperator}
                    className="w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed text-xs"
                    placeholder={!selectedOperator && checkExpectedResult
                      ? formatArgument(checkExpectedResult.value, 'any')
                      : selectedOperator ? t('quality.value.placeholder') : t('quality.value.placeholderDisabled')}
                  />
                </div>

                {!preDefined && <div>
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
                </div>}
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
                      <option value="">
                        {check?.dimension ? t('quality.customQualityCheck.dimensionFromCheck', { dimension: check.dimension }) : t('quality.select')}
                      </option>
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

                <StableIdField
                  name={`quality-${context}-id-${index}`}
                  definition="DataQuality"
                  value={rule.id}
                  onChange={(id) => onUpdate(index, 'id', id)}
                  siblingIds={siblingIds}
                />
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default QualityEditor;
