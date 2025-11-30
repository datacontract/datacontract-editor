import { useState, useMemo } from 'react';
import { useEditorStore } from '../../store.js';
import Combobox from './Combobox.jsx';
import LinkIcon from './icons/LinkIcon.jsx';
import ChevronRightIcon from './icons/ChevronRightIcon.jsx';
import { parseYaml } from '../../utils/yaml.js';

/**
 * RelationshipEditor component for editing relationships between schemas/properties
 * Provides autocomplete suggestions based on available schemas and properties
 *
 * @param {Array} value - Array of relationship objects
 * @param {Function} onChange - Callback when array changes
 * @param {Array} relationshipTypeOptions - Options for relationship type dropdown
 * @param {boolean} showFrom - Whether to show the 'from' field (required for schema-level, hidden for property-level)
 */
const RelationshipEditor = ({ value = [], onChange, relationshipTypeOptions = ['foreignKey'], showFrom = false }) => {
  const yaml = useEditorStore((state) => state.yaml);

  // Generate schema.property suggestions from YAML
  const schemaPropertySuggestions = useMemo(() => {
    if (!yaml?.trim()) return [];

    try {
      const parsed = parseYaml(yaml);
      const schemas = parsed?.schema || [];
      const suggestions = [];

      schemas.forEach((schema) => {
        if (!schema?.name) return;

        // Add property-level suggestions only (schema.property format)
        if (schema.properties && Array.isArray(schema.properties)) {
          schema.properties.forEach((prop) => {
            if (prop?.name) {
              const fullPath = `${schema.name}.${prop.name}`;
              suggestions.push({
                id: fullPath,
                name: fullPath,
                label: fullPath,
                schemaName: schema.name,
                propertyName: prop.name
              });
            }
          });
        }
      });

      return suggestions;
    } catch {
      return [];
    }
  }, [yaml]);

  const handleAdd = () => {
    const newRelationship = { type: 'foreignKey', to: '', description: '' };
    if (showFrom) {
      newRelationship.from = '';
    }
    onChange([...value, newRelationship]);
  };

  const handleRemove = (index) => {
    const updatedArray = value.filter((_, i) => i !== index);
    onChange(updatedArray.length > 0 ? updatedArray : undefined);
  };

  const handleUpdate = (index, fieldName, fieldValue) => {
    const updatedArray = [...value];
    // Support updating multiple fields at once if fieldName is an object
    if (typeof fieldName === 'object') {
      updatedArray[index] = { ...updatedArray[index], ...fieldName };
    } else {
      updatedArray[index] = { ...updatedArray[index], [fieldName]: fieldValue };
    }
    onChange(updatedArray);
  };

  return (
    <div className="space-y-2">
      {/* Header with label and add button */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-700">Relationships</label>
        <button
          type="button"
          onClick={handleAdd}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
        >
          + Add
        </button>
      </div>

      {/* Existing relationships */}
      {value.map((item, index) => (
        <RelationshipCard
          key={index}
          item={item}
          index={index}
          relationshipTypeOptions={relationshipTypeOptions}
          schemaPropertySuggestions={schemaPropertySuggestions}
          validPaths={schemaPropertySuggestions.map(s => s.name)}
          showFrom={showFrom}
          onUpdate={handleUpdate}
          onRemove={handleRemove}
        />
      ))}
    </div>
  );
};

const RelationshipCard = ({ item, index, relationshipTypeOptions, schemaPropertySuggestions, validPaths, showFrom, onUpdate, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(!item.to || (Array.isArray(item.to) && item.to.length === 0));

  const inputClasses = "w-full rounded border border-gray-300 bg-white px-2 py-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs";

  // Check if a path is valid (exists in schema.property suggestions)
  const isValidPath = (path) => {
    if (!path || path.trim() === '') return true; // Empty is valid (not yet filled)
    return validPaths.includes(path);
  };

  // Helper to check if from/to are arrays (composite key)
  const isComposite = Array.isArray(item.from) || Array.isArray(item.to);

  // Normalize from/to to arrays for internal handling
  const getFromArray = () => {
    if (!item.from) return [''];
    if (Array.isArray(item.from)) return item.from.length > 0 ? item.from : [''];
    return [item.from];
  };

  const getToArray = () => {
    if (!item.to) return [''];
    if (Array.isArray(item.to)) return item.to.length > 0 ? item.to : [''];
    return [item.to];
  };

  // Update a specific pair in the from/to arrays
  const updatePair = (pairIndex, field, value) => {
    const fromArr = [...getFromArray()];
    const toArr = [...getToArray()];

    if (field === 'from') {
      fromArr[pairIndex] = value;
    } else {
      toArr[pairIndex] = value;
    }

    // If we have multiple pairs, store as arrays
    if (fromArr.length > 1 || toArr.length > 1) {
      // Update both fields at once to avoid race conditions
      onUpdate(index, { from: fromArr, to: toArr });
    } else {
      // Single pair - store as strings
      onUpdate(index, field, value);
    }
  };

  // Add a new from/to pair (makes it composite)
  const addPair = () => {
    const fromArr = [...getFromArray()];
    const toArr = [...getToArray()];
    fromArr.push('');
    toArr.push('');
    onUpdate(index, { from: fromArr, to: toArr });
  };

  // Remove a from/to pair
  const removePair = (pairIndex) => {
    const fromArr = [...getFromArray()];
    const toArr = [...getToArray()];
    fromArr.splice(pairIndex, 1);
    toArr.splice(pairIndex, 1);

    // If only one pair left, convert back to strings
    if (fromArr.length <= 1) {
      onUpdate(index, { from: fromArr[0] || '', to: toArr[0] || '' });
    } else {
      onUpdate(index, { from: fromArr, to: toArr });
    }
  };

  // Generate a summary of the relationship
  const getSummary = () => {
    const fromArr = getFromArray().filter(f => f);
    const toArr = getToArray().filter(t => t);

    if (showFrom && fromArr.length > 0 && toArr.length > 0) {
      if (fromArr.length > 1 || toArr.length > 1) {
        return `[${fromArr.join(', ')}] → [${toArr.join(', ')}]`;
      }
      return `${fromArr[0]} → ${toArr[0]}`;
    }
    if (toArr.length === 0) return null;
    if (toArr.length > 1) {
      return `[${toArr.join(', ')}]`;
    }
    return toArr[0];
  };

  const fromArray = getFromArray();
  const toArray = getToArray();
  const pairCount = Math.max(fromArray.length, toArray.length);

  return (
    <div className="border border-gray-200 rounded-md bg-white">
      {/* Header - Always visible */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <LinkIcon className="size-3 text-indigo-600 shrink-0" />
            <span className="text-xs font-medium text-gray-900">Relationship</span>
            {item.type && (
              <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{item.type}</span>
            )}
            {isComposite && (
              <span className="text-xs px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded">composite</span>
            )}
          </div>
          <div className="text-xs text-gray-600 mt-0.5 truncate">
            {getSummary() ? (
              <span className="font-mono">{getSummary()}</span>
            ) : (
              <span className="italic text-gray-400">New relationship</span>
            )}
          </div>
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
          {/* Type row */}
          <div className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-11">
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Type</label>
              <select
                value={item.type || ''}
                onChange={(e) => onUpdate(index, 'type', e.target.value)}
                className={inputClasses}
              >
                <option value="">Select...</option>
                {relationshipTypeOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="p-1 text-gray-400 cursor-pointer border border-gray-300 rounded hover:text-red-400 hover:border-red-400 transition-colors justify-self-end"
              title="Remove"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* From and To pairs */}
          {showFrom ? (
            <div className="space-y-2">
              {Array.from({ length: pairCount }).map((_, pairIndex) => (
                <div key={pairIndex} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <Combobox
                      label={pairIndex === 0 ? <span className="text-xs font-medium text-gray-700">From</span> : null}
                      options={schemaPropertySuggestions}
                      value={fromArray[pairIndex] || ''}
                      onChange={(val) => updatePair(pairIndex, 'from', val)}
                      placeholder="schema.property"
                      acceptAnyInput={true}
                      filterKey="name"
                      displayValue={(opt) => opt?.name || opt || ''}
                      hasError={!isValidPath(fromArray[pairIndex])}
                    />
                  </div>
                  <div className="col-span-5">
                    <Combobox
                      label={pairIndex === 0 ? <span className="text-xs font-medium text-gray-700">To</span> : null}
                      options={schemaPropertySuggestions}
                      value={toArray[pairIndex] || ''}
                      onChange={(val) => updatePair(pairIndex, 'to', val)}
                      placeholder="schema.property"
                      acceptAnyInput={true}
                      filterKey="name"
                      displayValue={(opt) => opt?.name || opt || ''}
                      hasError={!isValidPath(toArray[pairIndex])}
                    />
                  </div>
                  <div className="col-span-2 flex justify-end gap-1">
                    {pairCount > 1 && (
                      <button
                        type="button"
                        onClick={() => removePair(pairIndex)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove pair"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addPair}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                + Add column pair (composite key)
              </button>
            </div>
          ) : (
            <Combobox
              label={<span className="text-xs font-medium text-gray-700">To</span>}
              options={schemaPropertySuggestions}
              value={item.to || ''}
              onChange={(val) => onUpdate(index, 'to', val)}
              placeholder="schema.property"
              acceptAnyInput={true}
              filterKey="name"
              displayValue={(opt) => opt?.name || opt || ''}
              hasError={!isValidPath(item.to)}
            />
          )}

          {/* Description field */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Description</label>
            <textarea
              value={item.description || ''}
              onChange={(e) => onUpdate(index, 'description', e.target.value)}
              className={inputClasses}
              placeholder="Describe the relationship..."
              rows={2}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RelationshipEditor;
