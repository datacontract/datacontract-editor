/**
 * Resolves the references in `relationships` (`to`, and `from` at schema level) to the
 * schema and property they point at.
 *
 * ODCS allows two notations (https://bitol-io.github.io/open-data-contract-standard/latest/references/):
 * - shorthand, by name: `<schema name>.<property name>`
 * - fully qualified, by id: `schema/<schema id>/properties/<property id>`. A reference
 *   with a file before `#` (`other.yaml#/schema/...`) points into another contract.
 */

/**
 * Splits a "schemaName.propertyPath" reference by matching the longest schema
 * name that is a prefix of `reference` followed by '.'. ODCS schema names can
 * themselves contain dots (fully-qualified physical names), so splitting on
 * the first '.' mis-resolves the schema. Falls back to split-on-first-dot
 * when no schema matches.
 */
export const splitSchemaReference = (reference, schemaNames) => {
  if (typeof reference !== 'string') return [undefined, undefined];
  let longest = null;
  for (const name of schemaNames) {
    if (typeof name !== 'string') continue;
    if ((reference === name || reference.startsWith(name + '.')) &&
        (longest === null || name.length > longest.length)) {
      longest = name;
    }
  }
  if (longest !== null) {
    const remainder = reference.length > longest.length ? reference.slice(longest.length + 1) : '';
    return [longest, remainder];
  }
  const firstDot = reference.indexOf('.');
  if (firstDot === -1) return [reference, ''];
  return [reference.slice(0, firstDot), reference.slice(firstDot + 1)];
};

export const isFullyQualifiedReference = (reference) =>
  typeof reference === 'string' && (reference.includes('#') || /^\/?schema\//.test(reference));

/** Whether a reference points into another contract (`<file>#/schema/...`). */
export const isExternalReference = (reference) =>
  typeof reference === 'string' && reference.indexOf('#') > 0;

// The notation is defined on ids, but contracts without ids use names in the same
// notation (see issue #15), so a name is accepted when no id matches.
const findIndexByIdOrName = (items, key) => {
  if (!Array.isArray(items)) return -1;
  const byId = items.findIndex((item) => item != null && item.id === key);
  if (byId !== -1) return byId;
  return items.findIndex((item) => item != null && item.name === key);
};

const resolveFullyQualified = (reference, schemas) => {
  let path = reference;
  const anchor = path.indexOf('#');
  if (anchor > 0) return null; // points into another contract, see isExternalReference
  if (anchor === 0) path = path.slice(1);

  const segments = path.replace(/^\/+/, '').split('/');
  if (segments[0] !== 'schema' || !segments[1]) return null;
  const schemaIndex = findIndexByIdOrName(schemas, segments[1]);
  if (schemaIndex === -1) return null;
  if (segments.length === 2) return { schemaIndex, propertyIndex: -1 };
  // nested properties have no row of their own in the diagram
  if (segments.length !== 4 || segments[2] !== 'properties' || !segments[3]) return null;
  return { schemaIndex, propertyIndex: findIndexByIdOrName(schemas[schemaIndex].properties, segments[3]) };
};

const schemaNamesOf = (schemas) => schemas.map((s) => s?.name).filter((n) => typeof n === 'string');

/**
 * Resolves a relationship reference within the contract.
 *
 * @param {string} reference - shorthand or fully qualified reference
 * @param {Array} schemas - the contract's `schema` array
 * @param {string[]} [schemaNames] - names of `schemas`, pass them when resolving many references
 * @returns {{schemaIndex: number, propertyIndex: number} | null} null when the schema is not
 *   found in this contract; propertyIndex is -1 when the property is not found
 */
export const resolveReference = (reference, schemas, schemaNames) => {
  if (typeof reference !== 'string' || !reference || !Array.isArray(schemas)) return null;
  if (isFullyQualifiedReference(reference)) return resolveFullyQualified(reference, schemas);

  const [schemaName, propertyName] = splitSchemaReference(reference, schemaNames ?? schemaNamesOf(schemas));
  const schemaIndex = schemas.findIndex((s) => s != null && s.name === schemaName);
  if (schemaIndex === -1) return null;
  const properties = schemas[schemaIndex].properties;
  const propertyIndex = Array.isArray(properties)
    ? properties.findIndex((p) => p != null && p.name === propertyName)
    : -1;
  return { schemaIndex, propertyIndex };
};

/**
 * Whether a relationship's `to` (a reference, or an array of them for composite keys)
 * points at the given property.
 */
export const referencesProperty = (to, schemas, schemaIndex, propertyIndex, schemaNames) => {
  const references = Array.isArray(to) ? to : [to];
  return references.some((reference) => {
    const target = resolveReference(reference, schemas, schemaNames);
    return target !== null && target.schemaIndex === schemaIndex && target.propertyIndex === propertyIndex;
  });
};
