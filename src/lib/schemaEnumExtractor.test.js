import { describe, expect, it } from 'vitest';
import odcsSchema from '../utils/fixtures/odcs-json-schema-v3.1.0.json';
import odcsSchema320 from '../utils/fixtures/odcs-json-schema-v3.2.0.json';
import { getAllSchemaEnums, getSchemaEnumValues, hasSchemaEnum, hasSchemaProperty } from './schemaEnumExtractor.js';

describe('getSchemaEnumValues against the ODCS 3.1.0 schema', () => {
  it('reads a property-level enum from $defs.SchemaBaseProperty', () => {
    expect(getSchemaEnumValues(odcsSchema, 'logicalType', 'property')).toEqual([
      'string', 'date', 'timestamp', 'time', 'number', 'integer', 'object', 'array', 'boolean',
    ]);
  });

  it('reads the server type enum through the server context', () => {
    const types = getSchemaEnumValues(odcsSchema, 'type', 'server');
    expect(types).toContain('postgresql');
    expect(types).toContain('snowflake');
    expect(types).toHaveLength(34);
  });

  it('follows $ref and array items to reach quality.dimension on properties and schema objects', () => {
    const expected = ['accuracy', 'completeness', 'conformity', 'consistency', 'coverage', 'timeliness', 'uniqueness'];
    expect(getSchemaEnumValues(odcsSchema, 'quality.dimension', 'property')).toEqual(expected);
    expect(getSchemaEnumValues(odcsSchema, 'quality.dimension', 'schema')).toEqual(expected);
  });

  it('follows allOf composition to the relationship type', () => {
    expect(getSchemaEnumValues(odcsSchema, 'relationships.type', 'schema')).toEqual(['foreignKey']);
    expect(getSchemaEnumValues(odcsSchema, 'relationships.type', 'property')).toEqual(['foreignKey']);
  });

  it('looks into conditional then-branches for logicalTypeOptions', () => {
    // `logicalTypeOptions` is a bare object on the property; its fields, and the integer/number
    // `format` enum, only exist inside the per-logicalType `then` branches.
    const formats = getSchemaEnumValues(odcsSchema, 'logicalTypeOptions.format', 'property');
    expect(formats).toContain('i32');
    expect(getSchemaEnumValues(odcsSchema, 'logicalTypeOptions.minLength', 'property')).toBeNull();
  });

  it('reads root-level enums', () => {
    expect(getSchemaEnumValues(odcsSchema, 'apiVersion', 'root')).toContain('v3.1.0');
    expect(getSchemaEnumValues(odcsSchema, 'kind', 'root')).toEqual(['DataContract']);
  });

  it('returns null for fields without an enum or unknown paths', () => {
    expect(getSchemaEnumValues(odcsSchema, 'name', 'property')).toBeNull();
    expect(getSchemaEnumValues(odcsSchema, 'does.not.exist', 'property')).toBeNull();
    expect(getSchemaEnumValues(null, 'logicalType')).toBeNull();
    expect(hasSchemaEnum(odcsSchema, 'name', 'property')).toBe(false);
    expect(hasSchemaEnum(odcsSchema, 'logicalType', 'property')).toBe(true);
  });
});

describe('getSchemaEnumValues against the ODCS 3.2.0 schema', () => {
  it('picks up the values 3.2.0 adds without any editor change', () => {
    const logicalTypes = getSchemaEnumValues(odcsSchema320, 'logicalType', 'property');
    expect(logicalTypes).toContain('map');
    expect(logicalTypes).toContain('vector');

    expect(getSchemaEnumValues(odcsSchema320, 'semanticType', 'property')).toEqual(['column', 'measure', 'dimension']);

    const serverTypes = getSchemaEnumValues(odcsSchema320, 'type', 'server');
    expect(serverTypes).toHaveLength(44);
    expect(serverTypes).toContain('iceberg');
    expect(serverTypes).toContain('teradata');

    expect(getSchemaEnumValues(odcsSchema320, 'apiVersion', 'root')).toContain('v3.2.0');
  });
});

describe('hasSchemaProperty - the capability check behind version-specific fields', () => {
  it('finds ODCS 3.2.0 additions in the 3.2.0 schema, including allOf-inherited ones', () => {
    expect(hasSchemaProperty(odcsSchema320, 'semanticType', 'property')).toBe(true);
    expect(hasSchemaProperty(odcsSchema320, 'enum', 'property')).toBe(true);
    expect(hasSchemaProperty(odcsSchema320, 'map', 'property')).toBe(true);
    // synonyms and deprecated live on SchemaElement and are inherited via allOf
    expect(hasSchemaProperty(odcsSchema320, 'synonyms', 'property')).toBe(true);
    expect(hasSchemaProperty(odcsSchema320, 'deprecated', 'schema')).toBe(true);
    expect(hasSchemaProperty(odcsSchema320, 'context', 'root')).toBe(true);
    expect(hasSchemaProperty(odcsSchema320, 'context', 'schema')).toBe(true);
    expect(hasSchemaProperty(odcsSchema320, 'vendor', 'CustomProperty')).toBe(true);
    expect(hasSchemaProperty(odcsSchema320, 'customProperties', 'ServiceLevelAgreementProperty')).toBe(true);
    expect(hasSchemaProperty(odcsSchema320, 'logicalTypeOptions.dimensions', 'property')).toBe(true);
  });

  it('reports the same fields as absent in the 3.1.0 schema', () => {
    expect(hasSchemaProperty(odcsSchema, 'semanticType', 'property')).toBe(false);
    expect(hasSchemaProperty(odcsSchema, 'enum', 'property')).toBe(false);
    expect(hasSchemaProperty(odcsSchema, 'synonyms', 'property')).toBe(false);
    expect(hasSchemaProperty(odcsSchema, 'deprecated', 'schema')).toBe(false);
    expect(hasSchemaProperty(odcsSchema, 'context', 'root')).toBe(false);
    expect(hasSchemaProperty(odcsSchema, 'vendor', 'CustomProperty')).toBe(false);
    // and fields both versions share stay available
    expect(hasSchemaProperty(odcsSchema, 'logicalType', 'property')).toBe(true);
    expect(hasSchemaProperty(odcsSchema, 'quality.dimension', 'property')).toBe(true);
  });
});

describe('getSchemaEnumValues against schemas that use definitions', () => {
  const legacy = {
    definitions: {
      Server: { properties: { type: { $ref: '#/definitions/ServerType' } } },
      ServerType: { enum: ['a', 'b'] },
    },
  };

  it('resolves definitions and #/definitions refs', () => {
    expect(getSchemaEnumValues(legacy, 'type', 'server')).toEqual(['a', 'b']);
  });
});

describe('getAllSchemaEnums', () => {
  it('collects enums by path for a context', () => {
    const serverEnums = getAllSchemaEnums(odcsSchema, 'server');
    expect(serverEnums.type).toHaveLength(34);

    const propertyEnums = getAllSchemaEnums(odcsSchema, 'property');
    expect(propertyEnums.logicalType).toContain('string');
    expect(propertyEnums['quality.dimension']).toContain('accuracy');
  });

  it('terminates on recursive definitions', () => {
    const schemaEnums = getAllSchemaEnums(odcsSchema, 'schema');
    expect(schemaEnums.logicalType).toEqual(['object']);
  });
});
