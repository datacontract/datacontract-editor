import { YAML } from '../utils/yaml.js';

const ODCS_SCHEMA_URL = 'https://raw.githubusercontent.com/bitol-io/open-data-contract-standard/refs/heads/main/schema/odcs-json-schema-v3.1.0.json';

let cachedSchema = null;

/**
 * Fetch and cache the ODCS JSON schema
 */
export async function getOdcsSchema() {
  if (cachedSchema) return cachedSchema;

  try {
    const response = await fetch(ODCS_SCHEMA_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    cachedSchema = await response.json();
    return cachedSchema;
  } catch (e) {
    console.warn('Failed to fetch ODCS schema:', e.message);
    return null;
  }
}

/**
 * Extract context from YAML at given cursor position
 * @param {string} yamlText - The YAML content
 * @param {number} lineNumber - 1-based line number
 * @param {number} column - 1-based column number
 * @returns {object} Context information for completions
 */
export function extractYamlContext(yamlText, lineNumber, column) {
  const lines = yamlText.split('\n');
  const currentLine = lines[lineNumber - 1] || '';
  const textBeforeCursor = currentLine.substring(0, column - 1);

  // Calculate indent level (spaces before content)
  const indentMatch = currentLine.match(/^(\s*)/);
  const indent = indentMatch ? indentMatch[1].length : 0;

  // Determine what kind of completion we need
  const isAfterColon = textBeforeCursor.includes(':');
  const isAfterDash = textBeforeCursor.trim().startsWith('-');
  const isEmptyLine = currentLine.trim() === '';
  const isPartialKey = !isAfterColon && textBeforeCursor.trim().length > 0;

  // Extract the key being typed (if any)
  let partialKey = '';
  if (isPartialKey) {
    partialKey = textBeforeCursor.trim();
  }

  // Extract the current key (before colon)
  let currentKey = '';
  if (isAfterColon) {
    const keyMatch = textBeforeCursor.match(/^\s*-?\s*(\w+)\s*:/);
    if (keyMatch) currentKey = keyMatch[1];
  }

  // Extract value after colon (if any)
  let partialValue = '';
  if (isAfterColon) {
    const colonIndex = textBeforeCursor.lastIndexOf(':');
    partialValue = textBeforeCursor.substring(colonIndex + 1).trim();
  }

  // Try to parse YAML and find path at cursor
  const path = findYamlPathAtPosition(yamlText, lineNumber, column);

  return {
    lineNumber,
    column,
    indent,
    currentLine,
    textBeforeCursor,
    isAfterColon,
    isAfterDash,
    isEmptyLine,
    isPartialKey,
    partialKey,
    currentKey,
    partialValue,
    path,
    completionType: determineCompletionType({
      isAfterColon,
      isAfterDash,
      isEmptyLine,
      isPartialKey,
      path,
    }),
  };
}

/**
 * Determine what type of completion is needed
 */
function determineCompletionType({ isAfterColon, isAfterDash, isEmptyLine, isPartialKey, path }) {
  if (isAfterColon) return 'value';
  if (isAfterDash) return 'array-item';
  if (isEmptyLine || isPartialKey) return 'key';
  return 'key';
}

/**
 * Find the YAML path at a given position by parsing with positions
 */
function findYamlPathAtPosition(yamlText, lineNumber, column) {
  try {
    // Parse with CST to get position info
    const doc = YAML.parseDocument(yamlText, { keepSourceTokens: true });
    if (!doc.contents) return [];

    const path = [];
    let node = doc.contents;
    const targetOffset = getOffsetFromLineCol(yamlText, lineNumber, column);

    // Walk the tree to find the path
    while (node) {
      if (YAML.isMap(node)) {
        let foundItem = null;
        for (const pair of node.items) {
          const pairRange = getPairRange(pair, yamlText);
          if (pairRange && targetOffset >= pairRange.start && targetOffset <= pairRange.end) {
            const keyStr = YAML.isScalar(pair.key) ? String(pair.key.value) : null;
            if (keyStr) path.push(keyStr);
            foundItem = pair.value;
            break;
          }
        }
        if (!foundItem) break;
        node = foundItem;
      } else if (YAML.isSeq(node)) {
        let foundIdx = -1;
        for (let i = 0; i < node.items.length; i++) {
          const item = node.items[i];
          const itemRange = getNodeRange(item);
          if (itemRange && targetOffset >= itemRange[0] && targetOffset <= itemRange[1]) {
            foundIdx = i;
            break;
          }
        }
        if (foundIdx >= 0) {
          path.push(foundIdx);
          node = node.items[foundIdx];
        } else {
          // Cursor is in array but not in an item - likely adding new item
          path.push(node.items.length);
          break;
        }
      } else {
        break;
      }
    }

    return path;
  } catch (e) {
    // Fallback: use indentation-based path detection
    return findPathByIndentation(yamlText, lineNumber);
  }
}

/**
 * Get byte offset from line and column
 */
function getOffsetFromLineCol(text, line, col) {
  const lines = text.split('\n');
  let offset = 0;
  for (let i = 0; i < line - 1 && i < lines.length; i++) {
    offset += lines[i].length + 1; // +1 for newline
  }
  return offset + Math.min(col - 1, (lines[line - 1] || '').length);
}

/**
 * Get range of a YAML pair
 */
function getPairRange(pair, yamlText) {
  const keyRange = getNodeRange(pair.key);
  const valueRange = getNodeRange(pair.value);

  if (!keyRange) return null;

  const start = keyRange[0];
  let end = valueRange ? valueRange[1] : keyRange[1];

  // Extend end to include the full value (including nested content)
  if (pair.value && YAML.isCollection(pair.value)) {
    const valueEndRange = getNodeRange(pair.value);
    if (valueEndRange) end = valueEndRange[1];
  }

  return { start, end };
}

/**
 * Get range [start, end] of a YAML node
 */
function getNodeRange(node) {
  if (!node) return null;
  if (node.range) return node.range;
  return null;
}

/**
 * Fallback: Find path by indentation analysis
 */
function findPathByIndentation(yamlText, targetLine) {
  const lines = yamlText.split('\n');
  const path = [];
  let currentIndent = -1;

  for (let i = 0; i < targetLine && i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimStart();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const indent = line.length - trimmed.length;

    // Check if this is an array item
    const isArrayItem = trimmed.startsWith('-');

    // Extract key if present
    const keyMatch = trimmed.match(/^-?\s*(\w+)\s*:/);

    if (indent <= currentIndent) {
      // Going back up the tree - pop items
      while (path.length > 0 && indent <= currentIndent) {
        path.pop();
        currentIndent -= 2;
      }
    }

    if (keyMatch) {
      path.push(keyMatch[1]);
      currentIndent = indent;
    } else if (isArrayItem && path.length > 0) {
      // Count array index
      const lastKey = path[path.length - 1];
      if (typeof lastKey === 'string') {
        // First item in this array
        path.push(0);
      } else if (typeof lastKey === 'number') {
        path[path.length - 1] = lastKey + 1;
      }
    }
  }

  return path;
}

/**
 * Get completions from schema at the given path
 * @param {object} schema - ODCS JSON schema
 * @param {object} context - Context from extractYamlContext
 * @returns {Array<{label: string, kind: string, detail?: string, insertText?: string}>}
 */
export function getSchemaCompletions(schema, context) {
  if (!schema) return [];

  const { path, completionType, partialKey, currentKey, isAfterDash } = context;

  // Navigate to the schema node for this path
  const schemaNode = navigateSchema(schema, path);
  if (!schemaNode) return [];

  const completions = [];

  if (completionType === 'value') {
    // Completing a value after ":"
    const propSchema = getPropertySchema(schemaNode, currentKey, schema);
    if (propSchema) {
      completions.push(...getValueCompletions(propSchema, schema));
    }
  } else if (completionType === 'key' || completionType === 'array-item') {
    // Completing a key name
    const properties = getAvailableProperties(schemaNode, schema);
    for (const [name, propSchema] of Object.entries(properties)) {
      if (!partialKey || name.toLowerCase().startsWith(partialKey.toLowerCase())) {
        completions.push({
          label: name,
          kind: 'property',
          detail: getPropertyDetail(propSchema),
          insertText: `${name}: `,
          sortText: isRequired(schemaNode, name, schema) ? `0${name}` : `1${name}`,
        });
      }
    }
  }

  return completions;
}

/**
 * Navigate schema to find the node at a given path
 */
function navigateSchema(schema, path) {
  let node = schema;

  for (let i = 0; i < path.length; i++) {
    const segment = path[i];

    if (typeof segment === 'number') {
      // Array index - get items schema
      const itemsSchema = resolveRef(node.items, schema);
      if (itemsSchema) {
        node = itemsSchema;
      } else {
        return node;
      }
    } else {
      // Property name
      const resolved = resolveRef(node, schema);
      const props = resolved?.properties || {};
      const propSchema = props[segment];
      if (propSchema) {
        node = resolveRef(propSchema, schema);
      } else {
        // Try additionalProperties
        if (resolved?.additionalProperties) {
          node = resolveRef(resolved.additionalProperties, schema);
        } else {
          return resolved;
        }
      }
    }
  }

  return resolveRef(node, schema);
}

/**
 * Resolve $ref in schema
 */
function resolveRef(node, schema) {
  if (!node) return null;
  if (node.$ref) {
    const refPath = node.$ref.replace('#/$defs/', '').replace('#/definitions/', '');
    return schema.$defs?.[refPath] || schema.definitions?.[refPath] || node;
  }
  // Handle oneOf/anyOf - return first valid option for simplicity
  if (node.oneOf) return resolveRef(node.oneOf[0], schema);
  if (node.anyOf) return resolveRef(node.anyOf[0], schema);
  return node;
}

/**
 * Get property schema by name
 */
function getPropertySchema(parentSchema, propName, schema) {
  const resolved = resolveRef(parentSchema, schema);
  const props = resolved?.properties || {};
  return props[propName] ? resolveRef(props[propName], schema) : null;
}

/**
 * Get available properties from a schema node
 */
function getAvailableProperties(node, schema) {
  const resolved = resolveRef(node, schema);
  if (!resolved) return {};

  const properties = {};

  // Direct properties
  if (resolved.properties) {
    for (const [name, propSchema] of Object.entries(resolved.properties)) {
      properties[name] = resolveRef(propSchema, schema);
    }
  }

  // From allOf
  if (resolved.allOf) {
    for (const sub of resolved.allOf) {
      const subResolved = resolveRef(sub, schema);
      if (subResolved?.properties) {
        for (const [name, propSchema] of Object.entries(subResolved.properties)) {
          properties[name] = resolveRef(propSchema, schema);
        }
      }
    }
  }

  return properties;
}

/**
 * Get value completions based on property schema
 */
function getValueCompletions(propSchema, schema) {
  const completions = [];
  const resolved = resolveRef(propSchema, schema);

  if (!resolved) return completions;

  // Enum values
  if (resolved.enum) {
    for (const val of resolved.enum) {
      completions.push({
        label: String(val),
        kind: 'enum',
        detail: 'enum value',
        insertText: typeof val === 'string' ? `"${val}"` : String(val),
      });
    }
    return completions;
  }

  // Boolean
  if (resolved.type === 'boolean') {
    completions.push(
      { label: 'true', kind: 'value', insertText: 'true' },
      { label: 'false', kind: 'value', insertText: 'false' }
    );
    return completions;
  }

  // Const value
  if (resolved.const !== undefined) {
    completions.push({
      label: String(resolved.const),
      kind: 'value',
      detail: 'required value',
      insertText: typeof resolved.const === 'string' ? `"${resolved.const}"` : String(resolved.const),
    });
    return completions;
  }

  // Type hints
  if (resolved.type === 'string') {
    if (resolved.format === 'date-time') {
      completions.push({
        label: 'now',
        kind: 'snippet',
        detail: 'Current ISO timestamp',
        insertText: `"${new Date().toISOString()}"`,
      });
    } else if (resolved.format === 'uuid' || resolved.format === 'uri') {
      completions.push({
        label: resolved.format,
        kind: 'snippet',
        detail: `Enter a ${resolved.format}`,
        insertText: '""',
      });
    }
  }

  // Array - suggest starting an array
  if (resolved.type === 'array') {
    completions.push({
      label: '[]',
      kind: 'snippet',
      detail: 'Start array',
      insertText: '\n  - ',
    });
  }

  // Object - suggest starting an object
  if (resolved.type === 'object' && resolved.properties) {
    completions.push({
      label: '{}',
      kind: 'snippet',
      detail: 'Start object',
      insertText: '\n  ',
    });
  }

  return completions;
}

/**
 * Get a short detail string for a property
 */
function getPropertyDetail(propSchema) {
  if (!propSchema) return '';
  if (propSchema.type) return propSchema.type;
  if (propSchema.enum) return `enum (${propSchema.enum.length} values)`;
  if (propSchema.$ref) return propSchema.$ref.split('/').pop();
  return '';
}

/**
 * Check if a property is required
 */
function isRequired(parentSchema, propName, schema) {
  const resolved = resolveRef(parentSchema, schema);
  return resolved?.required?.includes(propName) || false;
}

/**
 * Main function: Get completions for a YAML document at cursor position
 */
export async function getCompletions(yamlText, lineNumber, column) {
  const schema = await getOdcsSchema();
  const context = extractYamlContext(yamlText, lineNumber, column);
  return getSchemaCompletions(schema, context);
}
