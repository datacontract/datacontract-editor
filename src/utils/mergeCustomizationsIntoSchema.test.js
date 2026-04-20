import { describe, it, expect } from 'vitest';
import Ajv2019 from 'ajv/dist/2019.js';
import addFormats from 'ajv-formats';
import { mergeCustomizationsIntoSchema } from './mergeCustomizationsIntoSchema.js';
import baseSchema from './fixtures/odcs-json-schema-v3.1.0.json';

function compileSchema(schema) {
	const ajv = new Ajv2019({ allErrors: true, strict: false, validateFormats: true });
	addFormats(ajv);
	return ajv.compile(schema);
}

const VALID_BASE = {
	version: '1.0.0',
	apiVersion: 'v3.1.0',
	kind: 'DataContract',
	id: 'test-contract',
	status: 'active',
};

describe('mergeCustomizationsIntoSchema', () => {
	it('returns unmodified schema when no customizations', () => {
		const result = mergeCustomizationsIntoSchema(baseSchema, null);
		expect(result).toBe(baseSchema); // same reference, not cloned
	});

	it('compiles without errors when customizations are applied', () => {
		const customizations = {
			dataContract: {
				root: {
					standardProperties: [
						{ property: 'status', enum: ['draft', 'active', 'deprecated'] },
						{ property: 'id', required: true, pattern: '^[a-z][a-z0-9-]*$' },
					],
					customProperties: [
						{ property: 'dataOwner', type: 'email', required: true },
						{ property: 'costCenter', type: 'select', enum: ['CC-100', 'CC-200'] },
					],
				},
			},
		};

		const merged = mergeCustomizationsIntoSchema(baseSchema, customizations);
		expect(() => compileSchema(merged)).not.toThrow();
	});

	it('enforces enum on standard properties', () => {
		const customizations = {
			dataContract: {
				root: {
					standardProperties: [
						{ property: 'status', enum: ['draft', 'active'] },
					],
				},
			},
		};

		const merged = mergeCustomizationsIntoSchema(baseSchema, customizations);
		const validate = compileSchema(merged);

		// Valid status
		expect(validate({ ...VALID_BASE, status: 'draft' })).toBe(true);

		// Invalid status
		expect(validate({ ...VALID_BASE, status: 'unknown' })).toBe(false);
		const enumError = validate.errors.find((e) => e.keyword === 'enum');
		expect(enumError).toBeTruthy();
	});

	it('enforces pattern on standard properties', () => {
		const customizations = {
			dataContract: {
				root: {
					standardProperties: [
						{ property: 'version', pattern: '^\\d+\\.\\d+\\.\\d+$' },
					],
				},
			},
		};

		const merged = mergeCustomizationsIntoSchema(baseSchema, customizations);
		const validate = compileSchema(merged);

		expect(validate({ ...VALID_BASE, version: '1.0.0' })).toBe(true);
		expect(validate({ ...VALID_BASE, version: 'bad' })).toBe(false);
	});

	it('enforces required on standard properties', () => {
		const customizations = {
			dataContract: {
				root: {
					standardProperties: [
						{ property: 'name', required: true },
					],
				},
			},
		};

		const merged = mergeCustomizationsIntoSchema(baseSchema, customizations);
		const validate = compileSchema(merged);

		// Missing name
		expect(validate({ ...VALID_BASE })).toBe(false);
		const reqError = validate.errors.find(
			(e) => e.keyword === 'required' && e.params.missingProperty === 'name'
		);
		expect(reqError).toBeTruthy();

		// With name
		expect(validate({ ...VALID_BASE, name: 'Test' })).toBe(true);
	});

	it('validates custom property value types via if/then', () => {
		const customizations = {
			dataContract: {
				root: {
					customProperties: [
						{ property: 'dataOwner', type: 'email' },
						{ property: 'retentionDays', type: 'integer' },
					],
				},
			},
		};

		const merged = mergeCustomizationsIntoSchema(baseSchema, customizations);
		const validate = compileSchema(merged);

		// Valid email
		const validContract = {
			...VALID_BASE,
			customProperties: [
				{ property: 'dataOwner', value: 'user@example.com' },
			],
		};
		expect(validate(validContract)).toBe(true);

		// Invalid email
		const invalidContract = {
			...VALID_BASE,
			customProperties: [
				{ property: 'dataOwner', value: 'not-an-email' },
			],
		};
		expect(validate(invalidContract)).toBe(false);
	});

	it('validates custom property enum (select)', () => {
		const customizations = {
			dataContract: {
				root: {
					customProperties: [
						{ property: 'costCenter', type: 'select', enum: ['CC-100', 'CC-200'] },
					],
				},
			},
		};

		const merged = mergeCustomizationsIntoSchema(baseSchema, customizations);
		const validate = compileSchema(merged);

		const valid = {
			...VALID_BASE,
			customProperties: [{ property: 'costCenter', value: 'CC-100' }],
		};
		expect(validate(valid)).toBe(true);

		const invalid = {
			...VALID_BASE,
			customProperties: [{ property: 'costCenter', value: 'CC-999' }],
		};
		expect(validate(invalid)).toBe(false);
	});

	it('enforces required custom properties via contains', () => {
		const customizations = {
			dataContract: {
				root: {
					customProperties: [
						{ property: 'dataOwner', type: 'text', required: true },
					],
				},
			},
		};

		const merged = mergeCustomizationsIntoSchema(baseSchema, customizations);
		const validate = compileSchema(merged);

		// Missing required custom property
		const missing = { ...VALID_BASE };
		expect(validate(missing)).toBe(false);

		// Empty customProperties array (missing the required one)
		const empty = { ...VALID_BASE, customProperties: [] };
		expect(validate(empty)).toBe(false);

		// Has the required custom property
		const present = {
			...VALID_BASE,
			customProperties: [{ property: 'dataOwner', value: 'John' }],
		};
		expect(validate(present)).toBe(true);
	});

	it('works with schema.properties level', () => {
		const customizations = {
			dataContract: {
				'schema.properties': {
					customProperties: [
						{ property: 'piiCategory', type: 'select', enum: ['none', 'personal', 'sensitive'] },
					],
				},
			},
		};

		const merged = mergeCustomizationsIntoSchema(baseSchema, customizations);
		expect(() => compileSchema(merged)).not.toThrow();
	});

	it('works with multiple levels simultaneously', () => {
		const customizations = {
			dataContract: {
				root: {
					standardProperties: [
						{ property: 'status', enum: ['draft', 'active'] },
					],
					customProperties: [
						{ property: 'owner', type: 'email' },
					],
				},
				servers: {
					customProperties: [
						{ property: 'environment', type: 'select', enum: ['dev', 'staging', 'prod'] },
					],
				},
				team: {
					standardProperties: [
						{ property: 'name', required: true },
					],
				},
			},
		};

		const merged = mergeCustomizationsIntoSchema(baseSchema, customizations);
		expect(() => compileSchema(merged)).not.toThrow();
	});

	it('applies title and description as JSON Schema annotations', () => {
		const customizations = {
			dataContract: {
				root: {
					standardProperties: [
						{ property: 'status', title: 'Contract Status', description: 'Current lifecycle status' },
					],
				},
			},
		};

		const merged = mergeCustomizationsIntoSchema(baseSchema, customizations);
		expect(merged.properties.status.title).toBe('Contract Status');
		expect(merged.properties.status.description).toBe('Current lifecycle status');
	});

	it('works with object-keyed standardProperties format', () => {
		const customizations = {
			dataContract: {
				root: {
					standardProperties: {
						status: { enum: ['draft', 'active'] },
						version: { pattern: '^\\d+\\.\\d+\\.\\d+$' },
					},
				},
			},
		};

		const merged = mergeCustomizationsIntoSchema(baseSchema, customizations);
		const validate = compileSchema(merged);

		expect(validate({ ...VALID_BASE, status: 'draft' })).toBe(true);
		expect(validate({ ...VALID_BASE, status: 'unknown' })).toBe(false);
		expect(validate({ ...VALID_BASE, version: 'bad' })).toBe(false);
	});

	it('keeps schema and schema.properties custom property constraints independent', () => {
		const customizations = {
			dataContract: {
				schema: {
					customProperties: [
						{ property: 'retention', type: 'text', required: true },
					],
				},
				'schema.properties': {
					customProperties: [
						{ property: 'pii', type: 'boolean', required: true },
					],
				},
			},
		};

		const merged = mergeCustomizationsIntoSchema(baseSchema, customizations);
		expect(() => compileSchema(merged)).not.toThrow();

		// SchemaObject (schema level) should have retention constraints, not pii
		const schemaObjectAllOf = merged.$defs.SchemaObject.allOf;
		const schemaOverride = schemaObjectAllOf.find(
			(entry) => entry.properties?.customProperties
		);
		expect(schemaOverride).toBeDefined();
		const schemaItems = schemaOverride.properties.customProperties.items;
		expect(schemaItems.allOf.some((r) => r.if?.properties?.property?.const === 'retention')).toBe(true);
		expect(schemaItems.allOf.some((r) => r.if?.properties?.property?.const === 'pii')).toBe(false);

		// SchemaBaseProperty (schema.properties level) should have pii constraints, not retention
		const basePropAllOf = merged.$defs.SchemaBaseProperty.allOf;
		const propOverride = basePropAllOf.find(
			(entry) => entry.properties?.customProperties
		);
		expect(propOverride).toBeDefined();
		const propItems = propOverride.properties.customProperties.items;
		expect(propItems.allOf.some((r) => r.if?.properties?.property?.const === 'pii')).toBe(true);
		expect(propItems.allOf.some((r) => r.if?.properties?.property?.const === 'retention')).toBe(false);

		// The shared SchemaElement node should be untouched
		const sharedCp = merged.$defs.SchemaElement.properties.customProperties;
		expect(sharedCp.$ref || sharedCp.type).toBeDefined(); // still original form
	});

	describe('composed (allOf) standard property overrides', () => {
		const CONTRACT_WITH_SCHEMA = (schemaObj) => ({
			...VALID_BASE,
			schema: [
				{
					name: 'orders',
					properties: [{ name: 'id' }],
					...schemaObj,
				},
			],
		});

		it('enforces required on schema-level properties that live in SchemaElement (businessName, description)', () => {
			const customizations = {
				dataContract: {
					schema: {
						standardProperties: [
							{ property: 'businessName', required: true },
							{ property: 'description', required: true },
						],
					},
				},
			};

			const merged = mergeCustomizationsIntoSchema(baseSchema, customizations);
			const validate = compileSchema(merged);

			// Required constraints are injected into SchemaObject.allOf so validators
			// see them alongside the property declarations inherited via allOf → SchemaElement.
			const required = merged.$defs.SchemaObject.allOf
				.flatMap((e) => e.required || []);
			expect(required).toContain('businessName');
			expect(required).toContain('description');

			// Shared SchemaElement must stay untouched
			expect(merged.$defs.SchemaElement.required).toBeUndefined();

			// Both missing → both errors present
			expect(validate(CONTRACT_WITH_SCHEMA({}))).toBe(false);
			const missing = validate.errors
				.filter((e) => e.keyword === 'required')
				.map((e) => e.params.missingProperty);
			expect(missing).toContain('businessName');
			expect(missing).toContain('description');

			// Both present → valid
			expect(
				validate(CONTRACT_WITH_SCHEMA({ businessName: 'Orders', description: 'All orders' }))
			).toBe(true);
		});

		it('applies pattern on composed properties without mutating shared SchemaElement', () => {
			const customizations = {
				dataContract: {
					schema: {
						standardProperties: [
							{ property: 'businessName', pattern: '^[A-Z]' },
						],
					},
				},
			};

			const merged = mergeCustomizationsIntoSchema(baseSchema, customizations);
			const validate = compileSchema(merged);

			// Shared SchemaElement must not gain a pattern
			expect(merged.$defs.SchemaElement.properties.businessName.pattern).toBeUndefined();

			// SchemaObject.allOf should carry the level-specific override
			const overrideEntry = merged.$defs.SchemaObject.allOf.find(
				(e) => e.properties?.businessName?.pattern === '^[A-Z]'
			);
			expect(overrideEntry).toBeDefined();

			expect(validate(CONTRACT_WITH_SCHEMA({ businessName: 'Orders' }))).toBe(true);
			expect(validate(CONTRACT_WITH_SCHEMA({ businessName: 'orders' }))).toBe(false);
		});

		it('keeps schema and schema.properties level overrides on businessName independent', () => {
			const customizations = {
				dataContract: {
					schema: {
						standardProperties: [{ property: 'businessName', required: true }],
					},
					'schema.properties': {
						standardProperties: [{ property: 'businessName', pattern: '^col_' }],
					},
				},
			};

			const merged = mergeCustomizationsIntoSchema(baseSchema, customizations);
			const validate = compileSchema(merged);

			// Schema-level: businessName required, pattern does NOT apply
			expect(
				validate(CONTRACT_WITH_SCHEMA({
					businessName: 'orders',
					properties: [{ name: 'id', businessName: 'col_id' }],
				}))
			).toBe(true);

			// Schema property-level: pattern enforced
			expect(
				validate(CONTRACT_WITH_SCHEMA({
					businessName: 'orders',
					properties: [{ name: 'id', businessName: 'BAD' }],
				}))
			).toBe(false);

			// Shared SchemaElement must remain untouched
			expect(merged.$defs.SchemaElement.properties.businessName.pattern).toBeUndefined();
		});
	});
});
