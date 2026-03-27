/**
 * Merges customization constraints into the ODCS JSON Schema so that
 * AJV validates both the base ODCS structure and organisation-specific rules.
 *
 * @param {Object} baseSchema - The raw ODCS v3.1.0 JSON Schema
 * @param {Object|null} customizations - The editor customizations config
 * @returns {Object} A (deep-cloned) schema with customization rules merged in
 */
import { isSafeKey } from './safeProperty.js';

export function mergeCustomizationsIntoSchema(baseSchema, customizations) {
	if (!customizations?.dataContract) return baseSchema;

	const schema = structuredClone(baseSchema);
	const dc = customizations.dataContract;

	for (const [level, levelConfig] of Object.entries(dc)) {
		const mapping = LEVEL_MAPPINGS[level];
		if (!mapping) continue;

		const { standardProperties, customProperties } = levelConfig;

		if (standardProperties) {
			applyStandardOverrides(schema, mapping, normalizeStandardProperties(standardProperties));
		}

		if (customProperties?.length) {
			applyCustomPropertyConstraints(schema, mapping, customProperties);
		}
	}

	return schema;
}

// ---------------------------------------------------------------------------
// Level → schema-path mappings
// ---------------------------------------------------------------------------

/**
 * Each level maps to:
 *   propertiesPath  – where standard ODCS properties live in the schema
 *   customPropertiesPath – where the customProperties array lives
 *
 * Paths are arrays of keys to walk from the schema root.
 * A special "$defs" segment is used to navigate into $defs.
 */
const LEVEL_MAPPINGS = {
	root: {
		propertiesPath: ['properties'],
		customPropertiesPath: ['properties', 'customProperties'],
	},
	description: {
		propertiesPath: ['properties', 'description', 'properties'],
		customPropertiesPath: ['properties', 'description', 'properties', 'customProperties'],
	},
	schema: {
		// SchemaObject uses allOf → SchemaElement for customProperties
		propertiesPath: ['$defs', 'SchemaObject', 'properties'],
		customPropertiesPath: ['$defs', 'SchemaElement', 'properties', 'customProperties'],
		allOfDef: 'SchemaObject',
	},
	'schema.properties': {
		// SchemaBaseProperty uses allOf → SchemaElement for customProperties
		propertiesPath: ['$defs', 'SchemaBaseProperty', 'properties'],
		customPropertiesPath: ['$defs', 'SchemaElement', 'properties', 'customProperties'],
		allOfDef: 'SchemaBaseProperty',
	},
	servers: {
		propertiesPath: ['$defs', 'Server', 'properties'],
		customPropertiesPath: ['$defs', 'Server', 'properties', 'customProperties'],
	},
	team: {
		propertiesPath: ['$defs', 'Team', 'properties'],
		customPropertiesPath: ['$defs', 'Team', 'properties', 'customProperties'],
	},
	'team.members': {
		propertiesPath: ['$defs', 'TeamMember', 'properties'],
		customPropertiesPath: ['$defs', 'TeamMember', 'properties', 'customProperties'],
	},
	roles: {
		propertiesPath: ['$defs', 'Role', 'properties'],
		customPropertiesPath: ['$defs', 'Role', 'properties', 'customProperties'],
	},
	support: {
		propertiesPath: ['$defs', 'SupportItem', 'properties'],
		customPropertiesPath: ['$defs', 'SupportItem', 'properties', 'customProperties'],
	},
};

// ---------------------------------------------------------------------------
// Standard property overrides
// ---------------------------------------------------------------------------

function normalizeStandardProperties(sp) {
	if (!sp) return [];
	if (Array.isArray(sp)) return sp;
	return Object.entries(sp).map(([property, config]) => ({ property, ...config }));
}

function applyStandardOverrides(schema, mapping, overrides) {
	const properties = resolvePath(schema, mapping.propertiesPath);
	if (!properties) return;

	// Find the parent that holds the `required` array – one level up from propertiesPath
	const parentPath = mapping.propertiesPath.slice(0, -1);
	const parent = parentPath.length ? resolvePath(schema, parentPath) : schema;

	for (const override of overrides) {
		const { property, hidden, title, description, placeholder, ...constraints } = override;
		if (!isSafeKey(property)) continue;
		const propSchema = properties[property];
		if (!propSchema) continue;

		if (constraints.enum) {
			const enumValues = constraints.enum.map((e) =>
				typeof e === 'string' ? e : e.value
			);
			propSchema.enum = enumValues;
		}

		if (constraints.pattern) {
			propSchema.pattern = constraints.pattern;
		}

		if (constraints.minLength !== undefined) {
			propSchema.minLength = constraints.minLength;
		}

		if (constraints.maxLength !== undefined) {
			propSchema.maxLength = constraints.maxLength;
		}

		if (constraints.minimum !== undefined) {
			propSchema.minimum = constraints.minimum;
		}

		if (constraints.maximum !== undefined) {
			propSchema.maximum = constraints.maximum;
		}

		if (constraints.required === true && parent) {
			if (!parent.required) parent.required = [];
			if (!parent.required.includes(property)) {
				parent.required.push(property);
			}
		}
	}
}

// ---------------------------------------------------------------------------
// Custom property constraints (if/then on customProperties items)
// ---------------------------------------------------------------------------

/**
 * Maps customization field types to JSON Schema value constraints.
 */
function typeToValueSchema(config) {
	const { type, enum: enumValues } = config;

	switch (type) {
		case 'text':
		case 'textarea':
			return { type: 'string' };
		case 'number':
			return { type: 'number' };
		case 'integer':
			return { type: 'integer' };
		case 'boolean':
			return { type: 'boolean' };
		case 'date':
			return { type: 'string', format: 'date' };
		case 'datetime':
			return { type: 'string', format: 'date-time' };
		case 'url':
			return { type: 'string', format: 'uri' };
		case 'email':
			return { type: 'string', format: 'email' };
		case 'select': {
			const vals = (enumValues || []).map((e) => (typeof e === 'string' ? e : e.value));
			return { type: 'string', enum: vals };
		}
		case 'multiselect': {
			const vals = (enumValues || []).map((e) => (typeof e === 'string' ? e : e.value));
			return { type: 'array', items: { enum: vals } };
		}
		case 'array':
			return { type: 'array', items: { type: 'string' } };
		default:
			return {};
	}
}

function buildValueConstraints(config) {
	const valueSchema = typeToValueSchema(config);

	// Add extra constraints
	if (config.pattern && valueSchema.type === 'string') {
		valueSchema.pattern = config.pattern;
	}
	if (config.minLength !== undefined && valueSchema.type === 'string') {
		valueSchema.minLength = config.minLength;
	}
	if (config.maxLength !== undefined && valueSchema.type === 'string') {
		valueSchema.maxLength = config.maxLength;
	}
	if (config.minimum !== undefined && (valueSchema.type === 'number' || valueSchema.type === 'integer')) {
		valueSchema.minimum = config.minimum;
	}
	if (config.maximum !== undefined && (valueSchema.type === 'number' || valueSchema.type === 'integer')) {
		valueSchema.maximum = config.maximum;
	}

	return valueSchema;
}

function applyCustomPropertyConstraints(schema, mapping, customProperties) {
	// Resolve the customProperties schema node
	const cpNode = resolvePath(schema, mapping.customPropertiesPath);
	if (!cpNode) return;

	// If it's a $ref, we need to inline it so we can add per-level if/then
	let itemsSchema;
	if (cpNode.$ref) {
		// Resolve the $ref to get the base CustomProperties definition
		const resolved = resolveRef(schema, cpNode.$ref);
		if (!resolved) return;

		// Replace $ref with inline copy
		const inlined = structuredClone(resolved);
		Object.keys(cpNode).forEach((k) => delete cpNode[k]);
		Object.assign(cpNode, inlined);
	}

	// cpNode should now be { type: "array", items: ... }
	if (cpNode.type !== 'array') return;

	// Resolve items if it's a $ref
	if (cpNode.items?.$ref) {
		const resolvedItems = resolveRef(schema, cpNode.items.$ref);
		if (resolvedItems) {
			cpNode.items = structuredClone(resolvedItems);
		}
	}

	itemsSchema = cpNode.items;
	if (!itemsSchema) return;

	// Add if/then clauses for each custom property via allOf on items
	if (!itemsSchema.allOf) itemsSchema.allOf = [];

	for (const cp of customProperties) {
		const valueConstraints = buildValueConstraints(cp);
		if (Object.keys(valueConstraints).length === 0) continue;

		itemsSchema.allOf.push({
			if: {
				properties: { property: { const: cp.property } },
			},
			then: {
				properties: { value: valueConstraints },
			},
		});
	}

	// For required custom properties, add `contains` constraints on the array
	const requiredCps = customProperties.filter((cp) => cp.required);
	if (requiredCps.length > 0) {
		// Find the schema object that contains the customProperties property
		// e.g. for path ['properties', 'customProperties'], parent is at [] (root schema)
		// for path ['$defs', 'Server', 'properties', 'customProperties'], parent is at ['$defs', 'Server']
		const parentPath = mapping.customPropertiesPath.slice(0, -2);
		const parent = parentPath.length ? resolvePath(schema, parentPath) : schema;

		if (parent) {
			// Ensure customProperties is required on the parent
			if (!parent.required) parent.required = [];
			if (!parent.required.includes('customProperties')) {
				parent.required.push('customProperties');
			}
		}

		// Use allOf with contains for each required property
		if (!cpNode.allOf) cpNode.allOf = [];
		for (const cp of requiredCps) {
			cpNode.allOf.push({
				contains: {
					properties: { property: { const: cp.property } },
					required: ['property', 'value'],
				},
			});
		}
	}
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolvePath(obj, path) {
	let current = obj;
	for (const key of path) {
		if (current == null || typeof current !== 'object') return null;
		if (!isSafeKey(key)) return null;
		current = current[key];
	}
	return current;
}

function resolveRef(schema, ref) {
	// Only handle internal refs like "#/$defs/CustomProperties"
	if (!ref.startsWith('#/')) return null;
	const parts = ref.slice(2).split('/');
	return resolvePath(schema, parts);
}
