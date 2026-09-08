import { useMemo } from 'react';
import { useEditorStore } from '../../store.js';
import { getServerTypeSchemaFields, parsePortInput } from '../../lib/serverTypeFields.js';
import { useDocumentSupportsSchemaVersion } from '../../hooks/useSchemaCapability.js';

const inputClasses =
  'block w-full rounded-md border-0 py-1.5 pl-2 pr-3 text-gray-900 bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xs leading-4';

const fieldLabel = (name) => name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1');

/**
 * Renders server fields straight from the active JSON schema's per-type branch.
 *
 * Two uses: the complete field set for server types the editor has no hand-written form for
 * (everything ODCS 3.2.0 added), and — via [only] — just the fields a newer schema adds to a
 * type that does have a hand-written form (`encoding`, Athena's `workgroup`), so those appear
 * without duplicating the curated inputs.
 */
const SchemaDrivenServerFields = ({ serverType, server, updateServer, only = null }) => {
  const schemaData = useEditorStore((state) => state.schemaData);
  const documentSupportsSchema = useDocumentSupportsSchemaVersion();

  const fields = useMemo(() => {
    if (!documentSupportsSchema) return null;
    const schemaFields = getServerTypeSchemaFields(schemaData, serverType);
    if (!schemaFields) return null;
    return only ? schemaFields.filter((field) => only.includes(field.name)) : schemaFields;
  }, [schemaData, serverType, only, documentSupportsSchema]);

  if (!fields || fields.length === 0) return null;

  const update = (field, rawValue) => {
    if (field.isPort) {
      updateServer(field.name, parsePortInput(rawValue));
    } else if (field.isNumber) {
      const trimmed = (rawValue ?? '').trim();
      updateServer(field.name, trimmed === '' ? undefined : (/^-?\d+(\.\d+)?$/.test(trimmed) ? Number(trimmed) : rawValue));
    } else {
      updateServer(field.name, rawValue || undefined);
    }
  };

  return (
    <>
      {fields.map((field) => (
        <div key={field.name}>
          <label className="block text-xs font-medium leading-4 text-gray-900 mb-1" title={field.description || undefined}>
            {fieldLabel(field.name)}
            {field.required && <span className="text-red-500"> *</span>}
          </label>
          {field.enumValues ? (
            <select
              value={server?.[field.name] ?? ''}
              onChange={(e) => update(field, e.target.value)}
              className={inputClasses}
            >
              <option value=""></option>
              {field.enumValues.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              inputMode={field.isPort || field.isNumber ? 'numeric' : undefined}
              value={server?.[field.name] ?? ''}
              onChange={(e) => update(field, e.target.value)}
              className={inputClasses}
              placeholder={field.defaultValue !== undefined ? String(field.defaultValue) : ''}
            />
          )}
        </div>
      ))}
    </>
  );
};

export default SchemaDrivenServerFields;
