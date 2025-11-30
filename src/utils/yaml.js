import * as YAML from 'yaml';

/**
 * Default options for YAML stringification.
 * - QUOTE_DOUBLE for values (e.g., name: "value")
 * - PLAIN for keys (e.g., name: not "name":)
 */
const defaultOptions = {
  defaultStringType: 'QUOTE_DOUBLE',
  defaultKeyType: 'PLAIN',
};

/**
 * Stringify a JavaScript object to YAML with consistent formatting.
 * @param {any} value - The value to stringify
 * @param {object} options - Optional YAML stringify options (merged with defaults)
 * @returns {string} The YAML string
 */
export function stringifyYaml(value, options = {}) {
  return YAML.stringify(value, { ...defaultOptions, ...options });
}

/**
 * Parse a YAML string to a JavaScript object.
 * @param {string} yaml - The YAML string to parse
 * @returns {any} The parsed value
 */
export function parseYaml(yaml) {
  return YAML.parse(yaml);
}

// Re-export the original YAML module for cases where direct access is needed
export { YAML };
