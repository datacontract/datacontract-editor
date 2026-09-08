/**
 * Utility to extract enum values from JSON schemas dynamically.
 *
 * Works against the loaded ODCS schema (any version) and against host-composed schemas: it reads
 * `$defs` (with `definitions` as a fallback for older documents), follows `$ref`, and looks through
 * `allOf` / `anyOf` / `oneOf` / `if-then-else` composition and array `items`, which is where ODCS
 * keeps most of its structure (`SchemaBaseProperty` inherits from `SchemaElement` via `allOf`, and
 * `logicalTypeOptions` only gains properties inside conditional `then` branches).
 */

/** Editor contexts and the ODCS definition they refer to. Any other context is used as a definition name. */
const CONTEXT_DEFINITIONS = {
  property: 'SchemaBaseProperty',
  schema: 'SchemaObject',
  server: 'Server',
};

const definitionsOf = (schema) => schema?.$defs || schema?.definitions || {};

const resolveRef = (schema, ref) => {
  if (typeof ref !== 'string' || !ref.startsWith('#/')) return null;
  const segments = ref.slice(2).split('/');
  if (segments[0] !== '$defs' && segments[0] !== 'definitions') return null;
  // Nested definitions are legal and ODCS uses them (`#/$defs/ServerSource/KafkaServer`).
  let node = definitionsOf(schema);
  for (const segment of segments.slice(1)) {
    node = node?.[segment];
    if (!node) return null;
  }
  return node;
};

const branchesOf = (def) => [
  ...(Array.isArray(def.allOf) ? def.allOf : []),
  ...(Array.isArray(def.anyOf) ? def.anyOf : []),
  ...(Array.isArray(def.oneOf) ? def.oneOf : []),
  def.then,
  def.else,
];

/** The definition an editor context starts from. */
const baseDefinition = (schema, context) => {
  if (!schema) return null;
  if (context === 'root') return schema;
  const name = CONTEXT_DEFINITIONS[context] || context;
  return definitionsOf(schema)[name] || schema;
};

/**
 * Every sub-schema that describes property [name] inside [def], across `$ref` and composition.
 * More than one can match: `logicalTypeOptions` is declared as a bare object on the property and
 * refined inside each conditional branch.
 */
const findPropertyCandidates = (schema, def, name, seen = new Set()) => {
  if (!def || typeof def !== 'object' || seen.has(def)) return [];
  seen.add(def);

  const found = [];
  if (def.$ref) found.push(...findPropertyCandidates(schema, resolveRef(schema, def.$ref), name, seen));
  if (def.properties && Object.prototype.hasOwnProperty.call(def.properties, name)) {
    found.push(def.properties[name]);
  }
  for (const branch of branchesOf(def)) {
    found.push(...findPropertyCandidates(schema, branch, name, seen));
  }
  if (def.items) found.push(...findPropertyCandidates(schema, def.items, name, seen));
  return found;
};

/** The `enum` declared by [def] itself or by anything it composes. */
const findEnum = (schema, def, seen = new Set()) => {
  if (!def || typeof def !== 'object' || seen.has(def)) return null;
  seen.add(def);

  if (Array.isArray(def.enum)) return def.enum;
  if (def.$ref) {
    const viaRef = findEnum(schema, resolveRef(schema, def.$ref), seen);
    if (viaRef) return viaRef;
  }
  for (const branch of branchesOf(def)) {
    const viaBranch = findEnum(schema, branch, seen);
    if (viaBranch) return viaBranch;
  }
  return null;
};

/**
 * Get enum values for a property from the JSON schema
 * @param {Object} schema - The JSON schema object
 * @param {string} propertyPath - Dot-notation path to the property (e.g., 'logicalType', 'logicalTypeOptions.integerFormat')
 * @param {string} [context='property'] - Context where to look ('property', 'schema', 'server', 'root', or a definition name)
 * @returns {Array<string>|null} - Array of enum values or null if not found
 */
export const getSchemaEnumValues = (schema, propertyPath, context = 'property') => {
  const frontier = resolvePropertyCandidates(schema, propertyPath, context);
  for (const def of frontier) {
    const values = findEnum(schema, def);
    if (values) return values;
  }
  return null;
};

/** Every sub-schema describing [propertyPath] in [context]; empty when the schema lacks it. */
const resolvePropertyCandidates = (schema, propertyPath, context) => {
  if (!schema || !propertyPath) return [];

  const base = baseDefinition(schema, context);
  if (!base) return [];

  let frontier = [base];
  for (const part of propertyPath.split('.')) {
    const next = [];
    for (const def of frontier) {
      next.push(...findPropertyCandidates(schema, def, part));
    }
    if (next.length === 0) return [];
    frontier = next;
  }
  return frontier;
};

/**
 * Whether the schema defines a property at all — enum or not. This is the capability check the
 * form uses to offer version-specific fields (e.g. `semanticType` exists in ODCS 3.2.0+ only).
 */
export const hasSchemaProperty = (schema, propertyPath, context = 'property') =>
  resolvePropertyCandidates(schema, propertyPath, context).length > 0;

/**
 * Get all enum fields from the schema for a given context
 * @param {Object} schema - The JSON schema object
 * @param {string} [context='property'] - Context where to look
 * @returns {Object} - Map of field paths to their enum values
 */
export const getAllSchemaEnums = (schema, context = 'property') => {
  if (!schema) return {};

  const base = baseDefinition(schema, context);
  if (!base) return {};

  const enums = {};
  const seen = new Set();

  const walk = (def, prefix) => {
    if (!def || typeof def !== 'object' || seen.has(def)) return;
    seen.add(def);

    if (Array.isArray(def.enum) && prefix) {
      enums[prefix] = enums[prefix] || def.enum;
    }
    if (def.$ref) walk(resolveRef(schema, def.$ref), prefix);
    if (def.properties) {
      for (const [key, prop] of Object.entries(def.properties)) {
        walk(prop, prefix ? `${prefix}.${key}` : key);
      }
    }
    for (const branch of branchesOf(def)) walk(branch, prefix);
    if (def.items) walk(def.items, prefix);
  };

  walk(base, '');
  return enums;
};

/**
 * Check if a field should be rendered as a dropdown based on schema
 * @param {Object} schema - The JSON schema object
 * @param {string} propertyPath - Path to the property
 * @param {string} [context='property'] - Context where to look
 * @returns {boolean} - True if field has enum values in schema
 */
export const hasSchemaEnum = (schema, propertyPath, context = 'property') => {
  const enumValues = getSchemaEnumValues(schema, propertyPath, context);
  return enumValues !== null && enumValues.length > 0;
};
