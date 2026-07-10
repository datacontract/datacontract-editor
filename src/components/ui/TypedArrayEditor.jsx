import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ObjectYamlEditor from './ObjectYamlEditor.jsx';
import TypeChangeWarning from './TypeChangeWarning.jsx';
import { usePendingTypeChange } from '../../hooks/usePendingTypeChange.js';

/**
 * TypedArrayEditor edits an array whose elements are all the same primitive/object type.
 * The element type (string, number, boolean, or object) can be selected, and items are
 * added, edited, and removed inline in the style of ArrayInput.
 *
 * Local "rows" hold the raw editing state (e.g. number rows keep the typed text so a
 * partially-typed or empty field is not clobbered). The emitted array is derived from the
 * rows: for numbers, empty rows are simply left out of the array.
 *
 * @param {Array} value - The array being edited (actual JS array, not a string)
 * @param {Function} onChange - Callback with the updated array
 */
const ELEMENT_TYPES = ['string', 'number', 'boolean', 'object'];

const detectElementType = (arr) => {
  if (!Array.isArray(arr)) return null;
  const first = arr.find((v) => v !== null && v !== undefined);
  if (first === undefined) return null;
  if (typeof first === 'boolean') return 'boolean';
  if (typeof first === 'number') return 'number';
  if (typeof first === 'object') return 'object';
  return 'string';
};

const coerceObject = (item) => {
  if (item && typeof item === 'object' && !Array.isArray(item)) return item;
  if (typeof item === 'string') {
    try {
      const parsed = JSON.parse(item);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
};

const defaultRow = (type) => {
  if (type === 'object') return {};
  return ''; // string/number start as empty text; boolean starts unset ('')
};

// Convert an actual array value into a raw editing row for the given element type.
const toRow = (item, type) => {
  if (type === 'number') return item === null || item === undefined || item === '' ? '' : String(item);
  if (type === 'boolean') return item === true ? true : item === false ? false : ''; // '' = unset
  if (type === 'object') return coerceObject(item);
  if (item === null || item === undefined) return '';
  if (typeof item === 'object') {
    try {
      return JSON.stringify(item);
    } catch {
      return '';
    }
  }
  return String(item);
};

// Derive the actual array from the editing rows. Empty number rows and unset boolean rows
// are dropped, so an untouched auto-added first row leaves the stored value empty.
const rowsToArray = (rows, type) => {
  if (type === 'number') {
    return rows
      .map((r) => (String(r).trim() === '' ? null : parseFloat(r)))
      .filter((n) => n !== null && !isNaN(n));
  }
  if (type === 'boolean') return rows.filter((r) => r === true || r === false);
  if (type === 'object') return rows.map((r) => coerceObject(r));
  return rows.map((r) => (r === null || r === undefined ? '' : String(r)));
};

const sameArray = (a, b) => {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
};

const hasContent = (v) =>
  !(v === '' || v === null || v === undefined ||
    (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0));

// Changing the element type is destructive when existing items with content cannot be
// carried over: converting to "string" always stringifies (safe), but object<->scalar or
// a conversion that drops items (e.g. non-numeric strings -> number) clears content.
// Empty items (e.g. the auto-added first row) carry nothing, so they never warn.
const isDestructiveElementChange = (currentRows, fromType, toType) => {
  const values = rowsToArray(currentRows, fromType).filter(hasContent);
  if (values.length === 0) return false;
  if (toType === 'string') return false;
  if (fromType === 'object' || toType === 'object') return true;
  const after = rowsToArray(values.map((v) => toRow(v, toType)), toType);
  return after.length < values.length;
};

const TypedArrayEditor = ({ value = [], onChange }) => {
  const { t } = useTranslation();
  const externalArray = Array.isArray(value) ? value : [];
  const detected = detectElementType(externalArray);
  const [elementType, setElementType] = useState(detected || 'string');

  // Detected type wins when the array has items, otherwise use the selected type.
  const type = detected || elementType;

  // Show at least one row so an empty array (e.g. right after switching to the array type)
  // presents an element to edit. The empty row is local only — it is not written back until
  // the user gives it content.
  const withMinRow = (nextRows) => (nextRows.length ? nextRows : [defaultRow(type)]);

  const [rows, setRows] = useState(() =>
    withMinRow(externalArray.map((it) => toRow(it, detected || 'string')))
  );
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  // Resync local rows when the value changes from outside (e.g. undo), but ignore the
  // echo of our own onChange — otherwise an in-progress empty row would be wiped.
  useEffect(() => {
    if (!sameArray(rowsToArray(rowsRef.current, type), externalArray)) {
      setRows(withMinRow(externalArray.map((it) => toRow(it, type))));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const inputClasses =
    'flex-1 min-w-0 rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs';

  const commit = (nextRows, forType = type) => {
    setRows(nextRows);
    onChange(rowsToArray(nextRows, forType));
  };

  const applyTypeChange = (newType) => {
    const values = rowsToArray(rows, type);
    const newRows = values.map((v) => toRow(v, newType));
    setElementType(newType);
    commit(newRows, newType);
  };

  // Confirm destructive element-type changes before they clear existing items.
  const { pendingType, request: requestTypeChange, confirm: confirmTypeChange, cancel: cancelTypeChange } =
    usePendingTypeChange(applyTypeChange);

  const handleAdd = () => {
    commit([...rows, defaultRow(type)]);
  };

  const handleUpdate = (index, rawVal) => {
    const next = [...rows];
    next[index] = rawVal;
    commit(next);
  };

  const handleRemove = (index) => {
    commit(rows.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      {/* Element type selector */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500">{t('customProperty.arrayItemType')}</label>
        <select
          value={type}
          onChange={(e) => requestTypeChange(e.target.value, isDestructiveElementChange(rows, type, e.target.value))}
          className="rounded border border-gray-300 bg-white px-1 py-0.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs text-gray-600"
        >
          {ELEMENT_TYPES.map((et) => (
            <option key={et} value={et}>
              {et}
            </option>
          ))}
        </select>
      </div>

      {pendingType && (
        <TypeChangeWarning
          targetType={pendingType}
          onConfirm={confirmTypeChange}
          onCancel={cancelTypeChange}
        />
      )}

      {type === 'object' ? (
        /* Whole array edited as free-form YAML */
        <ObjectYamlEditor
          kind="array"
          value={rowsToArray(rows, 'object')}
          onChange={(arr) => commit(arr.map((it) => toRow(it, 'object')), 'object')}
        />
      ) : (
        <>
          {/* Existing items */}
          {rows.length > 0 && (
            <div className="space-y-1.5">
              {rows.map((row, index) => (
                <div key={`${type}-${index}`} className="flex items-start gap-1">
                  {type === 'number' ? (
                    <input
                      type="number"
                      step="any"
                      value={row}
                      onChange={(e) => handleUpdate(index, e.target.value)}
                      className={inputClasses}
                      placeholder="0"
                    />
                  ) : type === 'boolean' ? (
                    <select
                      value={row === true ? 'true' : row === false ? 'false' : ''}
                      onChange={(e) =>
                        handleUpdate(index, e.target.value === '' ? '' : e.target.value === 'true')
                      }
                      className={inputClasses}
                    >
                      <option value="">{t('customProperty.boolean.notSet')}</option>
                      <option value="false">false</option>
                      <option value="true">true</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={row}
                      onChange={(e) => handleUpdate(index, e.target.value)}
                      className={inputClasses}
                      placeholder={t('arrayInput.placeholder')}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    className="p-1 text-gray-400 cursor-pointer border border-gray-300 rounded hover:text-red-400 hover:border-red-400 transition-colors shrink-0"
                    title={t('arrayInput.remove')}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add button */}
          <button
            type="button"
            onClick={handleAdd}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            + {t('arrayInput.add')}
          </button>
        </>
      )}
    </div>
  );
};

export default TypedArrayEditor;
