import { describe, it, expect } from 'vitest';
import Ajv2019 from 'ajv/dist/2019.js';
import addFormats from 'ajv-formats';
import { relaxRelationshipType } from './relaxRelationshipType.js';
import schemaV310 from './fixtures/odcs-json-schema-v3.1.0.json';
import schemaV320 from './fixtures/odcs-json-schema-v3.2.0.json';

function compileSchema(schema) {
	const ajv = new Ajv2019({ allErrors: true, strict: false, validateFormats: true });
	addFormats(ajv);
	return ajv.compile(schema);
}

const contractWithRelationship = (apiVersion, relationship) => ({
	version: '1.0.0',
	apiVersion,
	kind: 'DataContract',
	id: 'test-contract',
	status: 'draft',
	schema: [
		{
			name: 'orders',
			properties: [{ name: 'customer_id', logicalType: 'string' }],
			relationships: [{ from: 'orders.customer_id', to: 'customers.id', ...relationship }],
		},
		{ name: 'customers', properties: [{ name: 'id', logicalType: 'string' }] },
	],
});

describe.each([
	['v3.1.0', schemaV310],
	['v3.2.0', schemaV320],
])('relaxRelationshipType (%s)', (apiVersion, baseSchema) => {
	it('the unmodified schema rejects a cardinality relationship type', () => {
		const validate = compileSchema(baseSchema);
		expect(validate(contractWithRelationship(apiVersion, { type: 'many-to-one' }))).toBe(false);
	});

	it('accepts a relationship type that is not foreignKey', () => {
		const validate = compileSchema(relaxRelationshipType(baseSchema));
		const valid = validate(contractWithRelationship(apiVersion, { type: 'many-to-one' }));
		expect(validate.errors).toBeNull();
		expect(valid).toBe(true);
	});

	it('still accepts foreignKey and a missing type', () => {
		const validate = compileSchema(relaxRelationshipType(baseSchema));
		expect(validate(contractWithRelationship(apiVersion, { type: 'foreignKey' }))).toBe(true);
		expect(validate(contractWithRelationship(apiVersion, {}))).toBe(true);
	});

	it('still requires the type to be a string', () => {
		const validate = compileSchema(relaxRelationshipType(baseSchema));
		expect(validate(contractWithRelationship(apiVersion, { type: 42 }))).toBe(false);
	});

	it('keeps foreignKey as the default and as a suggestion', () => {
		const type = relaxRelationshipType(baseSchema).$defs.RelationshipBase.properties.type;
		expect(type.enum).toBeUndefined();
		expect(type.default).toBe('foreignKey');
		expect(type.examples).toContain('foreignKey');
	});

	it('does not mutate the input schema', () => {
		relaxRelationshipType(baseSchema);
		expect(baseSchema.$defs.RelationshipBase.properties.type.enum).toEqual(['foreignKey']);
	});
});

describe('relaxRelationshipType with other schemas', () => {
	it('returns a schema without a relationship definition unchanged', () => {
		const schema = { title: 'custom' };
		expect(relaxRelationshipType(schema)).toBe(schema);
	});

	it('passes through null', () => {
		expect(relaxRelationshipType(null)).toBeNull();
	});
});
