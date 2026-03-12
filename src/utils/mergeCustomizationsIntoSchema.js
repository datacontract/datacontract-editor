/**
 * Merges customization constraints into the ODCS JSON Schema so that
 * AJV validates both the base ODCS structure and organisation-specific rules.
 *
 * @param {Object} baseSchema - The raw ODCS v3.1.0 JSON Schema
 * @param {Object|null} customizations - The editor customizations config
 * @returns {Object} A (deep-cloned) schema with customization rules merged in
 */
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
 *   propertiesPath         – where standard ODCS properties live in the schema
 *   customPropertiesPath   – where the customProperties array lives
 *   allOfDef (optional)    – when set, custom property constraints are injected
 *                            via allOf on this $defs entry instead of mutating
 *                            the shared customPropertiesPath node directly.
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
		const { property, hidden, placeholder, title, description, ...constraints } = override;
		const propSchema = properties[property];
		if (!propSchema) continue;

		if (title) propSchema.title = title;
		if (description) propSchema.description = description;

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

function resolveCustomPropertiesBase(schema, cpNode) {
	// If it's a $ref, resolve to get the actual definition
	if (cpNode.$ref) {
		const resolved = resolveRef(schema, cpNode.$ref);
		if (!resolved) return null;
		return structuredClone(resolved);
	}
	return structuredClone(cpNode);
}

function resolveItemsSchema(schema, cpSchema) {
	if (cpSchema.type !== 'array') return null;
	if (cpSchema.items?.$ref) {
		const resolvedItems = resolveRef(schema, cpSchema.items.$ref);
		if (resolvedItems) {
			cpSchema.items = structuredClone(resolvedItems);
		}
	}
	return cpSchema.items || null;
}

function applyCustomPropertyConstraints(schema, mapping, customProperties) {
	const cpNode = resolvePath(schema, mapping.customPropertiesPath);
	if (!cpNode) return;

	if (mapping.allOfDef) {
		// For levels that share a customPropertiesPath (e.g. schema and schema.properties
		// both point to SchemaElement), inject constraints into the level-specific $def
		// (e.g. SchemaObject or SchemaBaseProperty) via allOf, leaving the shared node untouched.
		applyCustomPropertyConstraintsViaAllOf(schema, mapping, customProperties, cpNode);
	} else {
		// For levels with their own customPropertiesPath, modify the node directly.
		applyCustomPropertyConstraintsInline(schema, mapping, customProperties, cpNode);
	}
}

function applyCustomPropertyConstraintsViaAllOf(schema, mapping, customProperties, cpNode) {
	// Build a standalone customProperties schema with level-specific constraints
	const cpSchema = resolveCustomPropertiesBase(schema, cpNode);
	if (!cpSchema) return;

	const itemsSchema = resolveItemsSchema(schema, cpSchema);
	if (!itemsSchema) return;

	// Add if/then clauses for value constraints
	if (!itemsSchema.allOf) itemsSchema.allOf = [];
	for (const cp of customProperties) {
		const valueConstraints = buildValueConstraints(cp);
		if (Object.keys(valueConstraints).length === 0) continue;
		itemsSchema.allOf.push({
			if: { properties: { property: { const: cp.property } } },
			then: { properties: { value: valueConstraints } },
		});
	}

	// Add contains constraints for required custom properties
	const requiredCps = customProperties.filter((cp) => cp.required);
	if (requiredCps.length > 0) {
		if (!cpSchema.allOf) cpSchema.allOf = [];
		for (const cp of requiredCps) {
			cpSchema.allOf.push({
				contains: {
					properties: { property: { const: cp.property } },
					required: ['property', 'value'],
				},
			});
		}
	}

	// Inject into the level-specific $def via allOf
	const defNode = schema.$defs?.[mapping.allOfDef];
	if (!defNode) return;

	if (!defNode.allOf) defNode.allOf = [];
	const allOfEntry = { properties: { customProperties: cpSchema } };

	// If there are required custom properties, also mark customProperties as required at this level
	if (requiredCps.length > 0) {
		allOfEntry.required = ['customProperties'];
	}

	defNode.allOf.push(allOfEntry);
}

function applyCustomPropertyConstraintsInline(schema, mapping, customProperties, cpNode) {
	// Inline the $ref if needed
	if (cpNode.$ref) {
		const resolved = resolveRef(schema, cpNode.$ref);
		if (!resolved) return;
		const inlined = structuredClone(resolved);
		Object.keys(cpNode).forEach((k) => delete cpNode[k]);
		Object.assign(cpNode, inlined);
	}

	if (cpNode.type !== 'array') return;

	// Resolve items if it's a $ref
	if (cpNode.items?.$ref) {
		const resolvedItems = resolveRef(schema, cpNode.items.$ref);
		if (resolvedItems) {
			cpNode.items = structuredClone(resolvedItems);
		}
	}

	const itemsSchema = cpNode.items;
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
		const parentPath = mapping.customPropertiesPath.slice(0, -2);
		const parent = parentPath.length ? resolvePath(schema, parentPath) : schema;

		if (parent) {
			if (!parent.required) parent.required = [];
			if (!parent.required.includes('customProperties')) {
				parent.required.push('customProperties');
			}
		}

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
