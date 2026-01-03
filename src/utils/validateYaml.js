import { parseYaml } from './yaml.js';
import Ajv2019 from 'ajv/dist/2019.js';
import addFormats from 'ajv-formats';

const ODCS_SCHEMA_URL = 'https://raw.githubusercontent.com/bitol-io/open-data-contract-standard/refs/heads/main/schema/odcs-json-schema-v3.1.0.json';

let cachedSchema = null;
let ajvInstance = null;
let validateFn = null;

/**
 * Fetch and cache the ODCS JSON schema
 */
async function getSchema() {
	if (cachedSchema) return cachedSchema;

	try {
		const response = await fetch(ODCS_SCHEMA_URL);
		if (!response.ok) {
			throw new Error(`Failed to fetch schema: ${response.status}`);
		}
		cachedSchema = await response.json();
		return cachedSchema;
	} catch (e) {
		console.warn('Failed to fetch ODCS schema:', e.message);
		return null;
	}
}

/**
 * Get or create AJV validator
 */
async function getValidator() {
	if (validateFn) return validateFn;

	const schema = await getSchema();
	if (!schema) return null;

	ajvInstance = new Ajv2019({
		allErrors: true,
		strict: false,
		validateFormats: false,
	});
	addFormats(ajvInstance);

	try {
		validateFn = ajvInstance.compile(schema);
		return validateFn;
	} catch (e) {
		console.warn('Failed to compile ODCS schema:', e.message);
		return null;
	}
}

/**
 * Validate a YAML string against ODCS v3.1.0 schema.
 *
 * @param {string} yamlString - The YAML content to validate
 * @returns {Promise<{isValid: boolean, errors: Array, parsed: any}>}
 */
export async function validateYaml(yamlString) {
	const errors = [];

	// Parse YAML to check syntax
	let parsed;
	try {
		parsed = parseYaml(yamlString);
	} catch (e) {
		return {
			isValid: false,
			errors: [
				{
					type: 'syntax',
					severity: 'error',
					message: `YAML syntax error: ${e.message}`,
					line: e.linePos?.[0]?.line,
				},
			],
			parsed: null,
		};
	}

	// Validate against ODCS JSON schema
	const validate = await getValidator();
	if (validate && parsed) {
		const valid = validate(parsed);
		if (!valid && validate.errors) {
			for (const err of validate.errors) {
				const message = formatAjvError(err);
				if (message) {
					errors.push({
						type: 'schema',
						severity: 'error',
						message,
						path: err.instancePath,
						keyword: err.keyword,
					});
				}
			}
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
		parsed,
	};
}

/**
 * Format AJV error into readable message
 */
function formatAjvError(err) {
	const path = err.instancePath || 'root';
	switch (err.keyword) {
		case 'required':
			return `${path}: missing required field '${err.params.missingProperty}'`;
		case 'type':
			return `${path}: expected ${err.params.type}`;
		case 'enum':
			return `${path}: must be one of ${err.params.allowedValues?.join(', ')}`;
		case 'additionalProperties':
			return `${path}: unknown field '${err.params.additionalProperty}'`;
		case 'if':
			return null; // Skip 'if' errors, the 'then' errors are more informative
		default:
			return `${path}: ${err.message}`;
	}
}
