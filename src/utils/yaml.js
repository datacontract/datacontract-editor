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

let yamlFormatConfig = { removeTrailingWhitespace: true, addFinalNewline: true };

export function setYamlFormatConfig(config) {
  yamlFormatConfig = { ...yamlFormatConfig, ...config };
}

export function applyYamlFormat(str) {
  if (!str) return str;
  if (yamlFormatConfig.removeTrailingWhitespace !== false) {
    str = str.replace(/[ \t]+$/gm, '');
  }
  if (yamlFormatConfig.addFinalNewline !== false) {
    if (!str.endsWith('\n')) str += '\n';
  } else {
    str = str.replace(/\n+$/, '');
  }
  return str;
}

/**
 * Stringify a JavaScript object to YAML with consistent formatting.
 * @param {any} value - The value to stringify
 * @param {object} options - Optional YAML stringify options (merged with defaults)
 * @returns {string} The YAML string
 */
export function stringifyYaml(value, options = {}) {
  const raw = YAML.stringify(value, { ...defaultOptions, ...options });
  return applyYamlFormat(raw);
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
