import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ValidatedInput from './ValidatedInput';
import { ValidatedCombobox } from './index';
import TagsInput from './TagsInput.jsx';
import Tooltip from './Tooltip';
import QuestionMarkCircleIcon from './icons/QuestionMarkCircleIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import { evaluateCondition } from '../../lib/conditionEvaluator';

/**
 * Validate a value against config constraints
 * @param {*} value - Current value
 * @param {Object} config - Property config
 * @returns {string[]} Array of error messages
 */
function validateValue(value, config, t) {
  const errors = [];
  const {
    required,
    pattern,
    patternMessage,
    minimum,
    maximum,
    minLength,
    maxLength,
    minItems,
    maxItems,
  } = config;

  // Required check
  if (required && (value === undefined || value === null || value === '')) {
    errors.push(t('customProperty.validation.required'));
    return errors; // Return early if required and empty
  }

  // Skip other validations if value is empty
  if (value === undefined || value === null || value === '') {
    if (minItems !== undefined && !Array.isArray(value)) {
      errors.push(t('customProperty.validation.minItems', { count: minItems }));
    }
    return errors;
  }

  // Pattern validation (for strings)
  if (pattern && typeof value === 'string') {
    try {
      if (!new RegExp(pattern).test(value)) {
        errors.push(patternMessage || t('customProperty.validation.pattern', { pattern }));
      }
    } catch (e) {
      // Invalid regex, skip validation
    }
  }

  // Length validation (for strings)
  if (typeof value === 'string') {
    if (minLength !== undefined && value.length < minLength) {
      errors.push(t('customProperty.validation.minLength', { count: minLength }));
    }
    if (maxLength !== undefined && value.length > maxLength) {
      errors.push(t('customProperty.validation.maxLength', { count: maxLength }));
    }
  }

  // Range validation (for numbers)
  if (typeof value === 'number') {
    if (minimum !== undefined && value < minimum) {
      errors.push(t('customProperty.validation.minimum', { value: minimum }));
    }
    if (maximum !== undefined && value > maximum) {
      errors.push(t('customProperty.validation.maximum', { value: maximum }));
    }
  }

  // Array items validation
  if (Array.isArray(value)) {
    if (minItems !== undefined && value.length < minItems) {
      errors.push(t('customProperty.validation.minItems', { count: minItems }));
    }
    if (maxItems !== undefined && value.length > maxItems) {
      errors.push(t('customProperty.validation.maxItems', { count: maxItems }));
    }
  }

  return errors;
}

/**
 * Renders the form-field label as the configured human-friendly title with
 * the technical property name appended inline in monospace — but only when a
 * title is configured and differs from the property name (compared
 * case-insensitively: a title that is just a cased variant of the property,
 * e.g. "Classification" vs "classification", adds no information). For
 * unconfigured (freeform) custom properties the property name IS the label,
 * so no duplicate is shown.
 */
const FieldLabel = ({ title, property }) => {
  const showTechnicalName = !!title && title.toLowerCase() !== String(property).toLowerCase();
  return (
    <>
      {title || property}
      {showTechnicalName && (
        <span className="ml-1.5 font-mono text-[10px] font-normal text-gray-500">{property}</span>
      )}
    </>
  );
};

/**
 * Text field sub-component
 */
const TextField = ({ config, value, onChange, errors }) => {
  const { property, title, placeholder, description, required } = config;

  return (
    <ValidatedInput
      name={property}
      label={<FieldLabel title={title} property={property} />}
      value={value || ''}
      onChange={(e) => onChange(e.target.value || undefined)}
      required={required}
      tooltip={description}
      placeholder={placeholder}
      externalErrors={errors}
      skipInternalValidation
    />
  );
};

/**
 * Textarea field sub-component
 */
const TextareaField = ({ config, value, onChange, errors }) => {
  const { t } = useTranslation();
  const {
    property,
    title,
    placeholder,
    description,
    required,
    rows = 3,
  } = config;
  const hasError = errors && errors.length > 0;

  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <label
          htmlFor={property}
          className="block text-xs font-medium leading-4 text-gray-900"
        >
          <FieldLabel title={title} property={property} />
        </label>
        {description && (
          <Tooltip content={description}>
            <QuestionMarkCircleIcon />
          </Tooltip>
        )}
        {required && (
          <span className="ml-auto text-xs leading-4 text-gray-500">
            {t('customProperty.required')}
          </span>
        )}
      </div>
      <textarea
        id={property}
        name={property}
        value={value || ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        rows={rows}
        placeholder={placeholder}
        className={`w-full rounded border bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs ${
          hasError ? 'border-red-300 ring-red-300' : 'border-gray-300'
        }`}
      />
      {errors?.map((err, i) => (
        <p key={i} className="mt-1 text-xs text-red-600">
          {err}
        </p>
      ))}
    </div>
  );
};

/**
 * Number/Integer field sub-component
 */
const NumberField = ({ config, value, onChange, errors }) => {
  const { t } = useTranslation();
  const {
    property,
    title,
    placeholder,
    description,
    required,
    minimum,
    maximum,
    step,
    type,
  } = config;
  const hasError = errors && errors.length > 0;

  const handleChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      onChange(undefined);
    } else {
      const num = type === 'integer' ? parseInt(val, 10) : parseFloat(val);
      onChange(isNaN(num) ? undefined : num);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <label
          htmlFor={property}
          className="block text-xs font-medium leading-4 text-gray-900"
        >
          <FieldLabel title={title} property={property} />
        </label>
        {description && (
          <Tooltip content={description}>
            <QuestionMarkCircleIcon />
          </Tooltip>
        )}
        {required && (
          <span className="ml-auto text-xs leading-4 text-gray-500">
            {t('customProperty.required')}
          </span>
        )}
      </div>
      <input
        type="number"
        id={property}
        name={property}
        value={value ?? ''}
        onChange={handleChange}
        min={minimum}
        max={maximum}
        step={step || (type === 'integer' ? 1 : 'any')}
        placeholder={placeholder}
        className={`w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4 ${
          hasError ? 'ring-red-300' : 'ring-gray-300'
        }`}
      />
      {errors?.map((err, i) => (
        <p key={i} className="mt-1 text-xs text-red-600">
          {err}
        </p>
      ))}
    </div>
  );
};

/**
 * Select field sub-component
 */
const SelectField = ({ config, value, onChange, errors }) => {
  const { t } = useTranslation();
  const {
    property,
    title,
    placeholder,
    description,
    required,
    enum: enumOptions,
  } = config;

  const options = useMemo(() => {
    if (!enumOptions) return [];
    return enumOptions.map((item) => {
      if (typeof item === 'string') {
        return { id: item, name: item };
      }
      return { id: item.value, name: item.label || item.title || item.value };
    });
  }, [enumOptions]);

  return (
    <ValidatedCombobox
      name={property}
      label={<FieldLabel title={title} property={property} />}
      options={options}
      value={value}
      onChange={(val) => onChange(val || undefined)}
      placeholder={placeholder || t('customProperty.select')}
      required={required}
      tooltip={description}
      externalErrors={errors}
      skipInternalValidation
    />
  );
};

/**
 * Multi-select field sub-component
 */
const MultiselectField = ({ config, value, onChange, errors }) => {
  const { t } = useTranslation();
  const {
    property,
    title,
    placeholder,
    description,
    required,
    enum: enumOptions,
  } = config;
  const hasError = errors && errors.length > 0;

  const options = useMemo(() => {
    if (!enumOptions) return [];
    return enumOptions.map((item) => {
      if (typeof item === 'string') {
        return { value: item, label: item };
      }
      return {
        value: item.value,
        label: item.label || item.title || item.value,
      };
    });
  }, [enumOptions]);

  const selectedValues = value || [];

  const toggleOption = (optValue) => {
    if (selectedValues.includes(optValue)) {
      const newValues = selectedValues.filter((v) => v !== optValue);
      onChange(newValues.length > 0 ? newValues : undefined);
    } else {
      onChange([...selectedValues, optValue]);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <label className="block text-xs font-medium leading-4 text-gray-900">
          <FieldLabel title={title} property={property} />
        </label>
        {description && (
          <Tooltip content={description}>
            <QuestionMarkCircleIcon />
          </Tooltip>
        )}
        {required && (
          <span className="ml-auto text-xs leading-4 text-gray-500">
            {t('customProperty.required')}
          </span>
        )}
      </div>
      <div
        className={`flex flex-wrap gap-1 p-2 rounded-md border ${hasError ? 'border-red-300' : 'border-gray-300'}`}
      >
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggleOption(opt.value)}
            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset transition-colors ${
              selectedValues.includes(opt.value)
                ? 'bg-indigo-100 text-indigo-700 ring-indigo-600/20'
                : 'bg-gray-50 text-gray-600 ring-gray-500/10 hover:bg-gray-100'
            }`}
          >
            {opt.label}
          </button>
        ))}
        {options.length === 0 && (
          <span className="text-xs text-gray-400">
            {placeholder || t('customProperty.noOptions')}
          </span>
        )}
      </div>
      {errors?.map((err, i) => (
        <p key={i} className="mt-1 text-xs text-red-600">
          {err}
        </p>
      ))}
    </div>
  );
};

/**
 * Boolean field sub-component
 */
const BooleanField = ({ config, value, onChange }) => {
  const { t } = useTranslation();
  const { property, title, description } = config;

  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <label
          htmlFor={property}
          className="block text-xs font-medium leading-4 text-gray-900"
        >
          <FieldLabel title={title} property={property} />
        </label>
        {description && (
          <Tooltip content={description}>
            <QuestionMarkCircleIcon />
          </Tooltip>
        )}
      </div>
      <div className="grid grid-cols-1">
        <select
          id={property}
          value={value === true ? 'true' : value === false ? 'false' : ''}
          onChange={(e) => {
            const newValue =
              e.target.value === 'true'
                ? true
                : e.target.value === 'false'
                  ? false
                  : undefined;
            onChange(newValue);
          }}
          className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs"
        >
          <option value="">{t('customProperty.boolean.notSet')}</option>
          <option value="false">{t('customProperty.boolean.false')}</option>
          <option value="true">{t('customProperty.boolean.true')}</option>
        </select>
        <ChevronDownIcon
          aria-hidden="true"
          className="pointer-events-none col-start-1 row-start-1 mr-2 size-4 self-center justify-self-end text-gray-500"
        />
      </div>
    </div>
  );
};

/**
 * Date field sub-component
 */
const DateField = ({ config, value, onChange, errors }) => {
  const { t } = useTranslation();
  const { property, title, placeholder, description, required, type } = config;
  const hasError = errors && errors.length > 0;
  const inputType = type === 'datetime' ? 'datetime-local' : 'date';

  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        <label
          htmlFor={property}
          className="block text-xs font-medium leading-4 text-gray-900"
        >
          <FieldLabel title={title} property={property} />
        </label>
        {description && (
          <Tooltip content={description}>
            <QuestionMarkCircleIcon />
          </Tooltip>
        )}
        {required && (
          <span className="ml-auto text-xs leading-4 text-gray-500">
            {t('customProperty.required')}
          </span>
        )}
      </div>
      <input
        type={inputType}
        id={property}
        name={property}
        value={value || ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        placeholder={placeholder}
        className={`w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4 ${
          hasError ? 'ring-red-300' : 'ring-gray-300'
        }`}
      />
      {errors?.map((err, i) => (
        <p key={i} className="mt-1 text-xs text-red-600">
          {err}
        </p>
      ))}
    </div>
  );
};

/**
 * URL field sub-component
 */
const UrlField = ({ config, value, onChange, errors }) => {
  const { property, title, placeholder, description, required } = config;

  return (
    <ValidatedInput
      name={property}
      label={<FieldLabel title={title} property={property} />}
      type="url"
      value={value || ''}
      onChange={(e) => onChange(e.target.value || undefined)}
      required={required}
      tooltip={description}
      placeholder={placeholder || 'https://example.com'}
      externalErrors={errors}
      skipInternalValidation
    />
  );
};

/**
 * Email field sub-component
 */
const EmailField = ({ config, value, onChange, errors }) => {
  const { property, title, placeholder, description, required } = config;

  return (
    <ValidatedInput
      name={property}
      label={<FieldLabel title={title} property={property} />}
      type="email"
      value={value || ''}
      onChange={(e) => onChange(e.target.value || undefined)}
      required={required}
      tooltip={description}
      placeholder={placeholder || 'user@example.com'}
      externalErrors={errors}
      skipInternalValidation
    />
  );
};

/**
 * Array field sub-component (uses Tags component)
 */
const ArrayField = ({ config, value, onChange, errors }) => {
  const { property, title, placeholder, description } = config;
  const hasError = errors && errors.length > 0;

  return (
    <div>
      <TagsInput
        label={<FieldLabel title={title} property={property} />}
        value={value || []}
        onChange={(val) => onChange(val && val.length > 0 ? val : undefined)}
        placeholder={placeholder}
        tooltip={description}
      />
      {hasError &&
        errors.map((err, i) => (
          <p key={i} className="mt-1 text-xs text-red-600">
            {err}
          </p>
        ))}
    </div>
  );
};

/**
 * Main CustomPropertyField component
 * Renders a custom property field based on its type configuration
 *
 * @param {Object} config - Property configuration from customization
 * @param {*} value - Current field value
 * @param {Function} onChange - Change handler (value) => void
 * @param {Object} context - Current data context for condition evaluation
 * @param {Object} yamlParts - Full YAML data for condition evaluation
 */
const CustomPropertyField = ({
  config,
  value,
  onChange,
  context = {},
  yamlParts = {},
  validationKey,
  validationSection,
}) => {
  const { t } = useTranslation();
  const { type = 'text', condition, hidden } = config;

  // hidden:true hides the property from form-style UIs (managed externally via API/YAML).
  // Monaco YAML editing remains unfiltered — this component does not drive that surface.
  // Mirrors the `hidden` semantics on standard properties.
  const shouldShow = useMemo(() => {
    if (hidden === true) return false;
    if (!condition) return true;
    return evaluateCondition(condition, yamlParts, context);
  }, [hidden, condition, yamlParts, context]);

  // Validate current value
  const validationErrors = useMemo(
    () => validateValue(value, config, t),
    [value, config, t],
  );

  if (!shouldShow) {
    return null;
  }

  switch (type) {
    case 'text':
      return (
        <TextField
          config={config}
          value={value}
          onChange={onChange}
          errors={validationErrors}
        />
      );

    case 'textarea':
      return (
        <TextareaField
          config={config}
          value={value}
          onChange={onChange}
          errors={validationErrors}
        />
      );

    case 'number':
    case 'integer':
      return (
        <NumberField
          config={config}
          value={value}
          onChange={onChange}
          errors={validationErrors}
        />
      );

    case 'select':
      return (
        <SelectField
          config={config}
          value={value}
          onChange={onChange}
          errors={validationErrors}
        />
      );

    case 'multiselect':
      return (
        <MultiselectField
          config={config}
          value={value}
          onChange={onChange}
          errors={validationErrors}
        />
      );

    case 'array':
      return (
        <ArrayField
          config={config}
          value={value}
          onChange={onChange}
          errors={validationErrors}
        />
      );

    case 'boolean':
      return <BooleanField config={config} value={value} onChange={onChange} />;

    case 'date':
    case 'datetime':
      return (
        <DateField
          config={config}
          value={value}
          onChange={onChange}
          errors={validationErrors}
        />
      );

    case 'url':
      return (
        <UrlField
          config={config}
          value={value}
          onChange={onChange}
          errors={validationErrors}
        />
      );

    case 'email':
      return (
        <EmailField
          config={config}
          value={value}
          onChange={onChange}
          errors={validationErrors}
        />
      );

    default:
      // Fallback to text input
      return (
        <TextField
          config={config}
          value={value}
          onChange={onChange}
          errors={validationErrors}
        />
      );
  }
};

export default CustomPropertyField;
