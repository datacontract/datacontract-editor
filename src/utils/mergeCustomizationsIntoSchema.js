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
	const defNode = mapping.allOfDef ? schema.$defs?.[mapping.allOfDef] : null;

	for (const override of overrides) {
		const { property, hidden, placeholder, title, description, ...constraints } = override;
		if (!isSafeKey(property)) continue;

		let propSchema = properties[property];
		let isComposed = false;

		// Fall back to the allOf composition chain (e.g. SchemaObject → SchemaElement)
		// so we can still apply overrides to inherited fields like `businessName` and `description`.
		if (!propSchema && defNode) {
			propSchema = findComposedProperty(schema, defNode, property);
			if (propSchema) isComposed = true;
		}

		const propertyExists = Boolean(propSchema);
		if (!propertyExists) continue;

		const localOverrides = {};
		if (title) localOverrides.title = title;
		if (description) localOverrides.description = description;

		if (constraints.enum) {
			localOverrides.enum = constraints.enum.map((e) =>
				typeof e === 'string' ? e : e.value
			);
		}
		if (constraints.pattern) localOverrides.pattern = constraints.pattern;
		if (constraints.minLength !== undefined) localOverrides.minLength = constraints.minLength;
		if (constraints.maxLength !== undefined) localOverrides.maxLength = constraints.maxLength;
		if (constraints.minimum !== undefined) localOverrides.minimum = constraints.minimum;
		if (constraints.maximum !== undefined) localOverrides.maximum = constraints.maximum;

		if (isComposed && defNode) {
			// Don't mutate the shared composed def (e.g. SchemaElement is used by both
			// SchemaObject and SchemaBaseProperty). Inject a level-specific override via allOf,
			// including `required` so validators (incl. monaco-yaml) see the required array
			// alongside the property definition.
			const hasLocalOverrides = Object.keys(localOverrides).length > 0;
			const isRequired = constraints.required === true;
			if (hasLocalOverrides || isRequired) {
				appendAllOfEntry(defNode, {
					properties: hasLocalOverrides ? { [property]: localOverrides } : undefined,
					required: isRequired ? [property] : undefined,
				});
			}
		} else {
			if (Object.keys(localOverrides).length > 0) {
				Object.assign(propSchema, localOverrides);
			}
			if (constraints.required === true && parent) {
				if (!parent.required) parent.required = [];
				if (!parent.required.includes(property)) {
					parent.required.push(property);
				}
			}
		}
	}
}

function findComposedProperty(schema, defNode, property, seen = new Set()) {
	if (!defNode || !Array.isArray(defNode.allOf)) return null;
	for (const entry of defNode.allOf) {
		if (entry?.$ref) {
			if (seen.has(entry.$ref)) continue;
			seen.add(entry.$ref);
			const resolved = resolveRef(schema, entry.$ref);
			if (!resolved) continue;
			if (resolved.properties?.[property]) return resolved.properties[property];
			const nested = findComposedProperty(schema, resolved, property, seen);
			if (nested) return nested;
		} else if (entry?.properties?.[property]) {
			return entry.properties[property];
		}
	}
	return null;
}

function appendAllOfEntry(defNode, entry) {
	if (!defNode.allOf) defNode.allOf = [];
	const clean = {};
	if (entry.properties) clean.properties = entry.properties;
	if (entry.required) clean.required = entry.required;
	if (Object.keys(clean).length === 0) return;
	defNode.allOf.push(clean);
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
	if (config.minItems !== undefined && valueSchema.type === 'array') {
		valueSchema.minItems = config.minItems;
	}
	if (config.maxItems !== undefined && valueSchema.type === 'array') {
		valueSchema.maxItems = config.maxItems;
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
		const thenClause = { properties: { value: valueConstraints } };
		if (valueConstraints.minItems !== undefined) {
			thenClause.required = ['value'];
		}
		itemsSchema.allOf.push({
			if: { properties: { property: { const: cp.property } } },
			then: thenClause,
		});
	}

	// Add contains constraints for custom properties that must be present
	// (either explicitly required, or implicitly via minItems)
	const mustExistCps = customProperties.filter((cp) => cp.required || (cp.minItems !== undefined && cp.minItems > 0));
	if (mustExistCps.length > 0) {
		if (!cpSchema.allOf) cpSchema.allOf = [];
		for (const cp of mustExistCps) {
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

	// If there are custom properties that must exist, also mark customProperties as required at this level
	if (mustExistCps.length > 0) {
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

		const thenClause = { properties: { value: valueConstraints } };
		if (valueConstraints.minItems !== undefined) {
			thenClause.required = ['value'];
		}
		itemsSchema.allOf.push({
			if: {
				properties: { property: { const: cp.property } },
			},
			then: thenClause,
		});
	}

	// Add contains constraints for custom properties that must be present
	// (either explicitly required, or implicitly via minItems)
	const mustExistCps = customProperties.filter((cp) => cp.required || (cp.minItems !== undefined && cp.minItems > 0));
	if (mustExistCps.length > 0) {
		const parentPath = mapping.customPropertiesPath.slice(0, -2);
		const parent = parentPath.length ? resolvePath(schema, parentPath) : schema;

		if (parent) {
			if (!parent.required) parent.required = [];
			if (!parent.required.includes('customProperties')) {
				parent.required.push('customProperties');
			}
		}

		if (!cpNode.allOf) cpNode.allOf = [];
		for (const cp of mustExistCps) {
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
