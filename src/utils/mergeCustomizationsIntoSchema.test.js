import { describe, it, expect, beforeAll } from 'vitest';
import Ajv2019 from 'ajv/dist/2019.js';
import addFormats from 'ajv-formats';
import { mergeCustomizationsIntoSchema } from './mergeCustomizationsIntoSchema.js';

const ODCS_SCHEMA_URL = 'https://raw.githubusercontent.com/bitol-io/open-data-contract-standard/refs/heads/main/schema/odcs-json-schema-v3.1.0.json';

let baseSchema;

beforeAll(async () => {
	const response = await fetch(ODCS_SCHEMA_URL);
	baseSchema = await response.json();
}, 15000);

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
});
