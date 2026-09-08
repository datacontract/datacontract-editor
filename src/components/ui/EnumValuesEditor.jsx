import { useTranslation } from 'react-i18next';

const inputClasses =
  'block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4';

/**
 * Editor for a property's `enum` — the allowed values a property may take (ODCS 3.2.0+).
 * Each entry needs a `value`; `label` and `description` are optional, and any other keys an
 * entry already carries (id, tags, customProperties, …) are preserved untouched.
 */
const EnumValuesEditor = ({ value = [], onChange }) => {
  const { t } = useTranslation();
  const entries = Array.isArray(value) ? value : [];

  const update = (index, field, fieldValue) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: fieldValue === '' ? undefined : fieldValue };
    onChange(updated);
  };

  const remove = (index) => {
    const updated = entries.filter((_, i) => i !== index);
    onChange(updated.length ? updated : undefined);
  };

  return (
    <div className="space-y-2">
      {entries.map((entry, index) => (
        <div key={index} className="flex gap-2 items-start">
          <input
            type="text"
            value={entry?.value ?? ''}
            onChange={(e) => update(index, 'value', e.target.value)}
            className={inputClasses}
            placeholder={t('enumValues.value.placeholder')}
          />
          <input
            type="text"
            value={entry?.label || ''}
            onChange={(e) => update(index, 'label', e.target.value)}
            className={inputClasses}
            placeholder={t('enumValues.label.placeholder')}
          />
          <input
            type="text"
            value={entry?.description || ''}
            onChange={(e) => update(index, 'description', e.target.value)}
            className={inputClasses}
            placeholder={t('enumValues.description.placeholder')}
          />
          <button
            type="button"
            onClick={() => remove(index)}
            className="p-1.5 text-gray-400 cursor-pointer border border-gray-300 rounded hover:text-red-400 hover:border-red-400 transition-colors flex-shrink-0"
            title={t('enumValues.remove')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...entries, { value: '' }])}
        className="w-full px-2 py-1 border-2 border-dashed border-gray-300 rounded text-xs text-gray-600 hover:border-indigo-400 hover:text-indigo-600"
      >
        {t('enumValues.add')}
      </button>
    </div>
  );
};

export default EnumValuesEditor;
