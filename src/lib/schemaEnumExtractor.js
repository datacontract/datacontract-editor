/**
 * Utility to extract enum values from JSON schemas dynamically.
 * Supports custom schemas by traversing the schema structure at runtime.
 */

/**
 * Get enum values for a property from the JSON schema
 * @param {Object} schema - The JSON schema object
 * @param {string} propertyPath - Dot-notation path to the property (e.g., 'logicalType', 'logicalTypeOptions.integerFormat')
 * @param {string} [context='property'] - Context where to look ('property', 'root', 'server', etc.)
 * @returns {Array<string>|null} - Array of enum values or null if not found
 */
export const getSchemaEnumValues = (schema, propertyPath, context = 'property') => {
  if (!schema || !propertyPath) return null;

  // Split the path into parts
  const pathParts = propertyPath.split('.');

  // Start from different base definitions depending on context
  let currentDef = null;

  if (context === 'property') {
    // Look in the SchemaBaseProperty definition (for property-level fields)
    currentDef = schema?.definitions?.SchemaBaseProperty;
  } else if (context === 'root') {
    // Look at root level properties
    currentDef = schema;
  } else {
    // Try to find the definition by name
    currentDef = schema?.definitions?.[context] || schema;
  }

  if (!currentDef) return null;

  // Traverse the path
  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];

    // Check in properties
    if (currentDef.properties && currentDef.properties[part]) {
      currentDef = currentDef.properties[part];
      continue;
    }

    // Check in definitions (for $ref references)
    if (currentDef.$ref) {
      const refPath = currentDef.$ref.replace('#/definitions/', '');
      currentDef = schema.definitions?.[refPath];
      if (currentDef && currentDef.properties && currentDef.properties[part]) {
        currentDef = currentDef.properties[part];
        continue;
      }
    }

    // Check if current definition has items (for arrays)
    if (currentDef && currentDef.items) {
      currentDef = currentDef.items;
      if (currentDef.properties && currentDef.properties[part]) {
        currentDef = currentDef.properties[part];
        continue;
      }
    }

    // Path not found
    return null;
  }

  // Follow $ref if present
  if (currentDef?.$ref) {
    const refPath = currentDef.$ref.replace('#/definitions/', '');
    currentDef = schema.definitions?.[refPath];
  }

  // Return enum if found
  return currentDef?.enum || null;
};

/**
 * Get all enum fields from the schema for a given context
 * @param {Object} schema - The JSON schema object
 * @param {string} [context='property'] - Context where to look
 * @returns {Object} - Map of field paths to their enum values
 */
export const getAllSchemaEnums = (schema, context = 'property') => {
  if (!schema) return {};

  const enums = {};
  let baseDef = null;

  if (context === 'property') {
    baseDef = schema?.definitions?.SchemaBaseProperty;
  } else if (context === 'root') {
    baseDef = schema;
  } else {
    baseDef = schema?.definitions?.[context] || schema;
  }

  if (!baseDef?.properties) return {};

  // Recursively find all enums in the properties
  const findEnums = (obj, prefix = '') => {
    if (!obj || typeof obj !== 'object') return;

    // Check if current object has enum
    if (obj.enum && Array.isArray(obj.enum)) {
      const key = prefix.replace(/\.$/, '');
      if (key) enums[key] = obj.enum;
    }

    // Check properties
    if (obj.properties) {
      Object.keys(obj.properties).forEach(key => {
        const prop = obj.properties[key];
        findEnums(prop, `${prefix}${key}.`);
      });
    }

    // Follow $ref
    if (obj.$ref) {
      const refPath = obj.$ref.replace('#/definitions/', '');
      const refDef = schema.definitions?.[refPath];
      if (refDef) {
        findEnums(refDef, prefix);
      }
    }

    // Check items (for arrays)
    if (obj.items) {
      findEnums(obj.items, prefix);
    }
  };

  findEnums(baseDef);
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
