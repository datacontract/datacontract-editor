import { parseYaml } from './yaml.js';
import Ajv2019 from 'ajv/dist/2019.js';
import addFormats from 'ajv-formats';
import { mergeCustomizationsIntoSchema } from './mergeCustomizationsIntoSchema.js';

const ODCS_SCHEMA_URL = 'https://raw.githubusercontent.com/bitol-io/open-data-contract-standard/refs/heads/main/schema/odcs-json-schema-v3.1.0.json';

let cachedSchema = null;

// Cache for compiled validators keyed by customizations hash
let cachedValidatorHash = null;
let cachedValidateFn = null;

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
 * Compute a simple hash of customizations for cache invalidation
 */
function hashCustomizations(customizations) {
	if (!customizations) return null;
	try {
		return JSON.stringify(customizations);
	} catch {
		return null;
	}
}

/**
 * Get or create AJV validator, recompiling when customizations change
 */
async function getValidator(customizations) {
	const hash = hashCustomizations(customizations);

	if (cachedValidateFn && cachedValidatorHash === hash) {
		return cachedValidateFn;
	}

	const baseSchema = await getSchema();
	if (!baseSchema) return null;

	const schema = mergeCustomizationsIntoSchema(baseSchema, customizations);

	const ajvInstance = new Ajv2019({
		allErrors: true,
		strict: false,
		validateFormats: true,
	});
	addFormats(ajvInstance);

	try {
		cachedValidateFn = ajvInstance.compile(schema);
		cachedValidatorHash = hash;
		return cachedValidateFn;
	} catch (e) {
		console.warn('Failed to compile ODCS schema:', e.message);
		return null;
	}
}

/**
 * Validate a YAML string against ODCS v3.1.0 schema.
 *
 * @param {string} yamlString - The YAML content to validate
 * @param {Object|null} customizations - Optional customizations to merge into schema
 * @returns {Promise<{isValid: boolean, errors: Array, parsed: any}>}
 */
export async function validateYaml(yamlString, customizations = null) {
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

	// Validate against ODCS JSON schema (with customizations merged in)
	const validate = await getValidator(customizations);
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
		case 'contains': {
			const propName = err.schema?.properties?.property?.const;
			return propName
				? `${path}: missing required custom property '${propName}'`
				: `${path}: missing required custom property`;
		}
		case 'format':
			return `${path}: must be a valid ${err.params.format}`;
		default:
			return `${path}: ${err.message}`;
	}
}
