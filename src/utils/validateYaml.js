import { parseYaml } from './yaml.js';
import Ajv2019 from 'ajv/dist/2019.js';
import addFormats from 'ajv-formats';
import { activeSchemaUrl, hashCustomizations, loadMergedSchema } from '../services/schemaRegistry.js';

// The compiled validator is kept for the schema URL and customization set it was built from and
// recompiled when either changes.
let cachedValidatorKey = null;
let cachedValidateFn = null;

/**
 * Get or create AJV validator, recompiling when the schema or the customizations change
 */
async function getValidator(customizations) {
	const url = activeSchemaUrl();
	const key = `${url}::${hashCustomizations(customizations)}`;

	if (cachedValidateFn && cachedValidatorKey === key) {
		return cachedValidateFn;
	}

	const schema = await loadMergedSchema(customizations, url);
	if (!schema) return null;

	const ajvInstance = new Ajv2019({
		allErrors: true,
		strict: false,
		validateFormats: true,
	});
	addFormats(ajvInstance);

	try {
		cachedValidateFn = ajvInstance.compile(schema);
		cachedValidatorKey = key;
		return cachedValidateFn;
	} catch (e) {
		console.warn('Failed to compile ODCS schema:', e.message);
		return null;
	}
}

/**
 * Validate a YAML string against the active ODCS schema.
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
