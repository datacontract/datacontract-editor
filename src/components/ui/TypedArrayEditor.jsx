import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  if (type === 'boolean') return false;
  if (type === 'object') return {};
  return ''; // string and number both start as empty text
};

// Convert an actual array value into a raw editing row for the given element type.
const toRow = (item, type) => {
  if (type === 'number') return item === null || item === undefined || item === '' ? '' : String(item);
  if (type === 'boolean') return item === true;
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

// Derive the actual array from the editing rows. Empty number rows are dropped.
const rowsToArray = (rows, type) => {
  if (type === 'number') {
    return rows
      .map((r) => (String(r).trim() === '' ? null : parseFloat(r)))
      .filter((n) => n !== null && !isNaN(n));
  }
  if (type === 'boolean') return rows.map((r) => r === true);
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

const TypedArrayEditor = ({ value = [], onChange }) => {
  const { t } = useTranslation();
  const externalArray = Array.isArray(value) ? value : [];
  const detected = detectElementType(externalArray);
  const [elementType, setElementType] = useState(detected || 'string');

  // Detected type wins when the array has items, otherwise use the selected type.
  const type = detected || elementType;

  const [rows, setRows] = useState(() => externalArray.map((it) => toRow(it, detected || 'string')));
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  // Resync local rows when the value changes from outside (e.g. undo), but ignore the
  // echo of our own onChange — otherwise an in-progress empty row would be wiped.
  useEffect(() => {
    if (!sameArray(rowsToArray(rowsRef.current, type), externalArray)) {
      setRows(externalArray.map((it) => toRow(it, type)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const inputClasses =
    'flex-1 min-w-0 rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs';

  const commit = (nextRows, forType = type) => {
    setRows(nextRows);
    onChange(rowsToArray(nextRows, forType));
  };

  const handleTypeChange = (newType) => {
    const values = rowsToArray(rows, type);
    const newRows = values.map((v) => toRow(v, newType));
    setElementType(newType);
    commit(newRows, newType);
  };

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
    <div className="space-y-1.5">
      {/* Element type selector */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500">{t('customProperty.arrayItemType')}</label>
        <select
          value={type}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="rounded border border-gray-300 bg-white px-1 py-0.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs text-gray-600"
        >
          {ELEMENT_TYPES.map((et) => (
            <option key={et} value={et}>
              {et}
            </option>
          ))}
        </select>
      </div>

      {/* Existing items */}
      {rows.length > 0 && (
        <div className="space-y-1">
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
                  value={row === true ? 'true' : 'false'}
                  onChange={(e) => handleUpdate(index, e.target.value === 'true')}
                  className={inputClasses}
                >
                  <option value="false">false</option>
                  <option value="true">true</option>
                </select>
              ) : type === 'object' ? (
                <ObjectItemInput
                  value={row}
                  onChange={(val) => handleUpdate(index, val)}
                  className={`${inputClasses} font-mono`}
                />
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
    </div>
  );
};

/**
 * ObjectItemInput edits a single object array element as JSON, keeping local text
 * state so partially-typed (temporarily invalid) JSON is not clobbered on every keystroke.
 */
const ObjectItemInput = ({ value, onChange, className }) => {
  const stringify = (val) => {
    try {
      return JSON.stringify(val ?? {}, null, 2);
    } catch {
      return '{}';
    }
  };

  const [text, setText] = useState(() => stringify(value));
  const [error, setError] = useState(false);

  // Sync when the value changes externally (e.g. type conversion) while not focused.
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) {
      setText(stringify(value));
      setError(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (e) => {
    const next = e.target.value;
    setText(next);
    try {
      const parsed = JSON.parse(next);
      setError(false);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        onChange(parsed);
      }
    } catch {
      setError(true);
    }
  };

  return (
    <textarea
      value={text}
      onChange={handleChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      rows={2}
      className={`${className} ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''}`}
      placeholder='{"key": "value"}'
    />
  );
};

export default TypedArrayEditor;
